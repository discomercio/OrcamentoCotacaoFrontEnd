import { Injectable, HostListener } from '@angular/core';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { PercMaxDescEComissaoResponseViewModel } from 'src/app/dto/percentual-comissao';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { ProdutoDto } from 'src/app/dto/produtos/ProdutoDto';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor(telaDesktopService: TelaDesktopService,
    public mensagemService: MensagemService,
    public readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService) { }

  public orcamentoCloneCotacaoDto = new OrcamentoCotacaoResponse();
  public orcamentoCotacaoDto: OrcamentoCotacaoResponse = new OrcamentoCotacaoResponse();
  public opcaoOrcamentoCotacaoDto: OrcamentosOpcaoResponse = new OrcamentosOpcaoResponse();
  public constantes: Constantes = new Constantes();
  public mostrarOpcoes: boolean;
  public controleProduto: Array<string> = new Array();
  public limiteQtdeProdutoOpcao: number = 12;
  public pageItens: number = 3;
  public lstProdutosSelecionados: ProdutoOrcamentoDto[] = new Array();
  public lstProdutosSelecionadosApoio: ProdutoOrcamentoDto[];
  public formaPagtoCriacaoAprazoApoio: FormaPagtoCriacao;
  public formaPagtoCriacaoAvistaApoio: FormaPagtoCriacao;
  public coeficientes: Array<CoeficienteDto>;
  public siglaPagto: string;
  public qtdeParcelas: number;
  public configValidade: ValidadeOrcamento;
  public moedaUtils: MoedaUtils = new MoedaUtils();
  public percRTApoio: number;

  tipoUsuario: number;
  percMaxComissaoEDescontoUtilizar: number;
  percentualMaxComissao: PercMaxDescEComissaoResponseViewModel;
  percentualMaxComissaoPadrao: PercMaxDescEComissaoResponseViewModel;
  editando: boolean;
  produtoComboDto = new ProdutoComboDto();
  descontoMedio: number;
  formaPagamento: FormaPagto[];
  usuarioLogado: Usuario;
  descontoGeral: number;
  editandoComissao: boolean;
  orcamentoAprovacao: AprovacaoOrcamentoDto;

  criarNovo() {
    this.orcamentoCotacaoDto = new OrcamentoCotacaoResponse();
    this.orcamentoCotacaoDto.entregaImediata = true;
    this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto = new Array<OrcamentosOpcaoResponse>();
    this.lstProdutosSelecionados = new Array();
  }

  criarNovoOrcamentoItem() {
    this.opcaoOrcamentoCotacaoDto = new OrcamentosOpcaoResponse();
    this.opcaoOrcamentoCotacaoDto.listaProdutos = new Array();
    this.descontoMedio = 0;

  }

  setarDados(ClienteOrcamentoCotacao: ClienteOrcamentoCotacaoDto) {
    this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = ClienteOrcamentoCotacao;
  }

  setarPercentualComissao() {

    this.percMaxComissaoEDescontoUtilizar = this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo == this.constantes.ID_PF ?
      this.percentualMaxComissao.percMaxComissaoEDesconto : this.percentualMaxComissao.percMaxComissaoEDescontoPJ;

    if (this.orcamentoCotacaoDto.parceiro == null || this.orcamentoCotacaoDto.parceiro == this.constantes.SEM_INDICADOR) return;

    if (!this.editando) {
      if (!this.orcamentoCotacaoDto.comissao) {
        this.opcaoOrcamentoCotacaoDto.percRT = 0;
        return;
      }
      if (this.percentualMaxComissao)
        this.opcaoOrcamentoCotacaoDto.percRT = this.percentualMaxComissao.percMaxComissao;
      return;
    }

    this.opcaoOrcamentoCotacaoDto.percRT = this.percentualMaxComissao.percMaxComissao;
  }

  public totalPedido(): number {

    if (this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length >= 0 &&
      !!this.opcaoOrcamentoCotacaoDto.listaProdutos) {
      return this.opcaoOrcamentoCotacaoDto.vlTotal = this.moedaUtils
        .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
          .reduce((sum, current) => sum + this.moedaUtils
            .formatarDecimal(current.totalItem), 0));
    }
  }

  public totalAVista(): number {
    if (this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length >= 0 &&
      !!this.opcaoOrcamentoCotacaoDto.listaProdutos) {
      let total = 0;
      this.opcaoOrcamentoCotacaoDto.listaProdutos.forEach((x) => {
        let descReal = 100 * (x.precoLista - x.precoVenda) / x.precoLista;
        let precoBaseVenda = this.moedaUtils
          .formatarDecimal((x.precoListaBase * (1 - descReal / 100)) * x.qtde);
        total += precoBaseVenda;
      });

      return total;
    }
  }

  calcularTotalItem(item: ProdutoOrcamentoDto): ProdutoOrcamentoDto {
    let produtosDto = this.montarProdutoParaCalcularItem(item.produto);

    let totalItem = 0;
    let precoVenda = 0;
    if (!item.alterouPrecoVenda) {
      produtosDto.forEach(x => {
        let precoLista = this.moedaUtils.formatarDecimal(x.precoListaBase * item.coeficienteDeCalculo);
        let precoVenda = this.moedaUtils.formatarDecimal(precoLista * (1 - item.descDado / 100));
        let totalComDesconto = this.moedaUtils.formatarDecimal(precoVenda * x.qtde);
        totalItem = this.moedaUtils.formatarDecimal(totalItem + totalComDesconto);
      });

      item.totalItem = totalItem;
    }
    if (item.alterouPrecoVenda) {

      item.totalItem = this.moedaUtils.formatarDecimal(item.precoVenda * item.qtde);
    }

    return item;
  }

  calcularTotalOrcamento(todosProdutosSimples: Array<ProdutoDto>, totalAPrazo: boolean): number {
    let totalPedido = 0;
    let produtosFiltrados = todosProdutosSimples.map(item => item.produto)
      .filter((value, index, self) => self.indexOf(value) === index);
    produtosFiltrados.forEach(x => {

      let itens = todosProdutosSimples.filter(f => f.produto == x);
      let precoListaBase = totalAPrazo ? itens[0].precoLista : itens[0].precoListaBase;
      let somaDesconto = itens.reduce((soma, valor) => soma + (valor.descDado * valor.qtde), 0);
      let somaQtde = itens.reduce((sum, current) => sum + current.qtde, 0);
      let descontoMedio = this.moedaUtils.formatarDecimal(somaDesconto / somaQtde);
      let totalPrecoLista = this.moedaUtils.formatarDecimal(precoListaBase * somaQtde);
      let totalComDesconto = this.moedaUtils.formatarDecimal(totalPrecoLista * (1 - descontoMedio / 100));
      totalPedido = totalPedido + totalComDesconto;
    });

    totalPedido = this.moedaUtils.formatarDecimal(totalPedido);
    return totalPedido;
  }

  montarProdutosParaCalculo(): Array<ProdutoDto> {
    let todosProdutosSimples = new Array<ProdutoDto>();
    this.opcaoOrcamentoCotacaoDto.listaProdutos.forEach(x => {
      let produtoComposto = this.produtoComboDto.produtosCompostos.filter(p => p.paiProduto == x.produto)[0];
      if (produtoComposto != null) {
        produtoComposto.filhos.forEach(el => {
          let itemFilhote = this.produtoComboDto.produtosSimples.filter(s => s.produto == el.produto)[0];
          itemFilhote.descDado = x.descDado;
          itemFilhote.qtde = el.qtde * x.qtde;
          todosProdutosSimples.push(Object.assign({}, itemFilhote));
        });
      }
      else {
        let itemSimples = this.produtoComboDto.produtosSimples.filter(s => s.produto == x.produto)[0];
        console.log(JSON.stringify(itemSimples));
        if (!!itemSimples) {
          itemSimples.descDado = !x.descDado ? 0 : x.descDado;
          itemSimples.qtde = x.qtde;
          todosProdutosSimples.push(Object.assign({}, itemSimples));
        }

      }
    });

    return todosProdutosSimples;
  }

  montarProdutoParaCalcularItem(produto: string): Array<ProdutoDto> {

    if (this.opcaoOrcamentoCotacaoDto.listaProdutos && this.opcaoOrcamentoCotacaoDto.listaProdutos.length > 0) {
      let todosProdutosSimples = new Array<ProdutoDto>();

      let itemCalulo = this.opcaoOrcamentoCotacaoDto.listaProdutos.filter(x => x.produto == produto)[0];
      let produtoComposto = this.produtoComboDto.produtosCompostos.filter(p => p.paiProduto == produto)[0];
      if (produtoComposto != null) {
        produtoComposto.filhos.forEach(el => {
          let itemFilhote = this.produtoComboDto.produtosSimples.filter(s => s.produto == el.produto)[0];
          itemFilhote.descDado = itemCalulo.descDado;
          itemFilhote.qtde = el.qtde * itemCalulo.qtde;
          todosProdutosSimples.push(Object.assign({}, itemFilhote));
        });
      }
      else {
        let itemSimples = this.produtoComboDto.produtosSimples.filter(s => s.produto == produto)[0];
        itemSimples.descDado = itemCalulo.descDado;
        itemSimples.qtde = itemCalulo.qtde;
        todosProdutosSimples.push(Object.assign({}, itemSimples));
      }
      return todosProdutosSimples;
    }
  }

  atribuirOpcaoPagto(lstFormaPagto: FormaPagtoCriacao[], formaPagamento: FormaPagto[]) {
    this.opcaoOrcamentoCotacaoDto.formaPagto = lstFormaPagto;
    this.formaPagamento = formaPagamento;
  }

  formatarFormaPagamento(opcaoOrcamentoCotacaoDto: OrcamentosOpcaoResponse, fPagto: FormaPagtoCriacao) {
    let texto: string = "";

    opcaoOrcamentoCotacaoDto.formaPagto.some((fp) => {

      let pagto = this.formaPagamento.filter(f => f.idTipoPagamento == fPagto.tipo_parcelamento)[0];

      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
        let total = 0;
        opcaoOrcamentoCotacaoDto.listaProdutos.forEach((x) => {
          let descReal = 100 * (x.precoLista - x.precoVenda) / x.precoLista;
          let precoBaseVenda = this.moedaUtils
            .formatarDecimal((x.precoListaBase * (1 - descReal / 100)) * x.qtde);
          total += precoBaseVenda;
        });
        let meio = pagto.meios.filter(m => m.id == fPagto.op_av_forma_pagto)[0].descricao;
        texto = pagto.tipoPagamentoDescricao + " em " + meio + " " + this.moedaUtils.formatarMoedaComPrefixo(total);
        return true;
      }
      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
        texto = pagto.tipoPagamentoDescricao + " em " + fp.c_pc_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp.c_pc_valor);
        return true;
      }
      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
        let meioEntrada = pagto.meios.filter(m => m.id.toString() == fPagto.op_pce_entrada_forma_pagto)[0].descricao;
        let meioPrestacao = pagto.meios.filter(m => m.id.toString() == fPagto.op_pce_prestacao_forma_pagto)[0].descricao;
        texto = pagto.tipoPagamentoDescricao + ":<br>Entrada: " + meioEntrada + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.o_pce_entrada_valor) +
          " <br> Demais Prestações: " + meioPrestacao + " em " + fPagto.c_pce_prestacao_qtde + " X de "
          + this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pce_prestacao_valor) + "<br> Período entre Parcelas: " +
          fPagto.c_pce_prestacao_periodo + " dias";
        return true;
      }
      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
        let meioPrimPrest = pagto.meios.filter(m => m.id.toString() == fPagto.op_pse_prim_prest_forma_pagto)[0].descricao;
        let meioPrestacao = pagto.meios.filter(m => m.id.toString() == fPagto.op_pse_demais_prest_forma_pagto)[0].descricao;
        texto = pagto.tipoPagamentoDescricao + ":<br>1º Prestação: " + meioPrestacao + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_prim_prest_valor) + " vencendo após " + fPagto.c_pse_prim_prest_apos + " dias" +
          "<br>Demais Prestações: " + meioPrestacao + " em " + fPagto.c_pse_demais_prest_qtde + " X de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_demais_prest_valor) + "<br>Período entre Parcelas: " +
          fPagto.c_pse_demais_prest_periodo + " dias";

        return true;
      }

      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
        let meio = pagto.meios.filter(m => m.id.toString() == fPagto.op_pu_forma_pagto)[0].descricao;
        texto = pagto.tipoPagamentoDescricao + " em " + meio + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pu_valor) + " vencendo após " + fPagto.c_pu_vencto_apos + " dias ";
        return true;
      }

      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
        texto = pagto.tipoPagamentoDescricao + " em " + fp.c_pc_maquineta_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp.c_pc_maquineta_valor);
        return true;
      }
    });
    return texto;
  }

  atribuirCoeficienteParaProdutos(qtdeParcelas: number) {

    let coeficiente = this.coeficientes.filter(x => x.TipoParcela == this.siglaPagto && x.QtdeParcelas == qtdeParcelas);
    this.lstProdutosSelecionados.forEach(x => {
      let fabricanteCoef = coeficiente.filter(c => c.Fabricante == x.fabricante)[0];
      x.coeficienteDeCalculo = fabricanteCoef.Coeficiente;
    });
  }

  calcularParcelas(qtdeParcelas: number) {
    if (!qtdeParcelas || qtdeParcelas <= 0)
      return;

    this.qtdeParcelas = qtdeParcelas;
    this.recalcularProdutosComCoeficiente(qtdeParcelas, this.coeficientes);
  }

  recalcularProdutosComCoeficiente(qtdeParcelas: number, coeficientes: CoeficienteDto[]) {
    if (!qtdeParcelas) {
      return;
    }
    this.coeficientes = coeficientes;

    this.qtdeParcelas = qtdeParcelas;

    this.lstProdutosSelecionados.forEach(x => {

      let coeficiente = this.coeficientes?.filter(c => c.Fabricante == x.fabricante && c.QtdeParcelas == qtdeParcelas && c.TipoParcela == this.siglaPagto)[0];

      let produtoComposto = this.produtoComboDto.produtosCompostos.filter(p => p.paiProduto == x.produto)[0];
      if (produtoComposto != null) {
        let somaFilhotes = 0;
        produtoComposto.filhos.forEach(el => {
          let itemFilhote = this.produtoComboDto.produtosSimples.filter(s => s.produto == el.produto)[0];
          let valorComCoeficiente = this.moedaUtils.formatarDecimal(itemFilhote.precoListaBase * coeficiente.Coeficiente);
          somaFilhotes += this.moedaUtils.formatarDecimal(valorComCoeficiente * el.qtde);
        });

        x.precoLista = somaFilhotes;
        x.precoVenda = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda) : x.precoLista;
        x.descDado = x.alterouPrecoVenda ? Number.parseFloat(((x.precoLista - x.precoVenda) * 100 / x.precoLista).toFixed(2)) : x.descDado;
        x.precoNF = x.precoVenda;
        x.coeficienteDeCalculo = coeficiente.Coeficiente;
        x.totalItem = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda * x.qtde) : this.moedaUtils.formatarDecimal(x.precoLista * x.qtde);

        // this.calcularPercentualComissao();
        return;
      }

      x.precoLista = this.moedaUtils.formatarDecimal(x.precoListaBase * coeficiente.Coeficiente);
      x.precoVenda = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda) : x.precoLista;
      x.descDado = x.alterouPrecoVenda ? Number.parseFloat(((x.precoLista - x.precoVenda) * 100 / x.precoLista).toFixed(2)) : x.descDado;
      x.precoNF = x.precoVenda;
      x.coeficienteDeCalculo = coeficiente.Coeficiente;
      x.totalItem = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda * x.qtde) : this.moedaUtils.formatarDecimal(x.precoLista * x.qtde);
    });

    // this.calcularPercentualComissao();

  }

  calcularDescontoMedio(): number {
    let totalSemDesc = this.moedaUtils
      .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
        .reduce((sum, current) => sum + this.moedaUtils
          .formatarDecimal((current.precoLista) * current.qtde), 0));

    let totalComDesc = this.totalPedido();

    let descMedio = (((totalSemDesc - totalComDesc) / totalSemDesc) * 100);

    this.descontoMedio = descMedio;

    return descMedio;
  }

  calcularPercentualComissaoValidacao() {
    let descMedio = this.calcularDescontoMedio();

    if (this.percMaxComissaoEDescontoUtilizar) {
      let descMax = this.percMaxComissaoEDescontoUtilizar - this.percentualMaxComissao.percMaxComissao;
      let comissao = this.percentualMaxComissao.percMaxComissao - (descMedio - descMax);
      return this.moedaUtils.formatarDecimal(comissao);
    }
  }

  verificarUsuarioEnvolvido(): boolean {
    let idUsuarioLogado = this.autenticacaoService.usuario.id;

    if (idUsuarioLogado == this.orcamentoCotacaoDto.idIndicadorVendedor) return true;
    if (idUsuarioLogado == this.orcamentoCotacaoDto.idIndicador) return true;
    if (idUsuarioLogado == this.orcamentoCotacaoDto.idVendedor) return true;
    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoEditar)) return true;

    return false;
  }

  get coeficientesParaCalculo(): Array<CoeficienteDto> {
    let coeficientesParaCalculo: CoeficienteDto[] = new Array<CoeficienteDto>();
    this.lstFabricantesDisctint.forEach(x => {
      let filtro = this.coeficientes?.filter(c => c.Fabricante == x && c.TipoParcela == this.siglaPagto && c.QtdeParcelas == this.qtdeParcelas)[0];
      coeficientesParaCalculo.push(filtro);
    });

    return coeficientesParaCalculo;
  }

  get lstFabricantesDisctint(): Array<string> {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    let fornecedores: string[] = new Array();

    this.lstProdutosSelecionados.forEach(element => {
      fornecedores.push(element.fabricante);
    });

    return fornecedores.filter(distinct);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 640) return "90vw";
    if (window.innerWidth > 640 && window.innerWidth <= 940) return "88vw";
    if (window.innerWidth > 940) return "65vw";
  }

  permiteEnviarMensagem(dataValidade, dataMaxTrocaMsg): boolean {
    let dataAtual = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    let dataMax = DataUtils.formata_dataString_para_formato_data(new Date(dataMaxTrocaMsg).toLocaleString("pt-br").slice(0, 10));
    if (dataAtual >= dataMax) return false;

    return this.validarExpiracao(dataValidade);
  }

  validarExpiracao(dataValidade): boolean {

    // transportando a validação já existente porque é chamada em mais de um lugar
    let dataAtual = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    let validade = dataValidade.toString().slice(0, 10);

    if (validade <= dataAtual) return false;

    return true;

  }

  verificarAlcadaUsuario(idOpcao: number): boolean {
    let opcao = this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == idOpcao);
    let maiorAlcadaUsuario = this.buscarMaiorAlcadaUsuario();

    if (opcao.length > 1) {
      this.alertaService.mostrarMensagem("Ocorreu um problema ao verificar uso de desconto superior!");
      return false;
    }

    let usouAlcada = false;
    let alcadaMenor = false;

    if (opcao.length == 1) {
      opcao[0].listaProdutos.forEach(x => {
        if (x.idOperacaoAlcadaDescontoSuperior != null) {
          usouAlcada = true;
          if (x.idOperacaoAlcadaDescontoSuperior > maiorAlcadaUsuario) {
            alcadaMenor = true;
            return;
          }
        }
      });
    }

    if (alcadaMenor) return false;

    if (usouAlcada && maiorAlcadaUsuario == null) return false;

    return true;
  }

  buscarMaiorAlcadaUsuario(): number {
    let lstAlcadas = new Array<number>();

    this.usuarioLogado.permissoes.forEach(x => {
      if (x == ePermissao.DescontoSuperior1 ||
        x == ePermissao.DescontoSuperior2 ||
        x == ePermissao.DescontoSuperior3) {
        lstAlcadas.push(Number.parseInt(x));
      }
    });

    if (lstAlcadas.length > 0) {
      return Math.max.apply(null, lstAlcadas);
    }

    return null;
  }

  validarDescontosProdutos(): boolean {
    let retorno = true;
    this.lstProdutosSelecionados.some(x => {
      if (x.descDado > this.percMaxComissaoEDescontoUtilizar) {
        return retorno = false;
      }
    });
    return retorno;
  }

  verificarDescontoGeral(): boolean {
    if (this.descontoGeral == undefined) {
      this.descontoGeral = 0;
      return true;
    }

    if (this.descontoGeral > this.percMaxComissaoEDescontoUtilizar) {
      this.mensagemService.showErrorViaToast([`O desconto geral excede o máximo permitido!`]);
      return false;
    }

    return true;
  }

  validarComissao(valor: any): boolean {

    if (Number.parseFloat(valor) > this.percentualMaxComissao.percMaxComissao) return false;

    let descontoMedio = this.calcularDescontoMedio();
    let limiteComissao = (this.percentualMaxComissao.percMaxComissao - (descontoMedio - (this.percMaxComissaoEDescontoUtilizar - this.percentualMaxComissao.percMaxComissao))).toFixed(2);

    if (Number.parseFloat(valor) <= Number.parseFloat(limiteComissao)) return true;

    if (Number.parseFloat(valor) > Number.parseFloat(limiteComissao) ||
      Number.parseFloat(valor) > this.percentualMaxComissao.percMaxComissao) return false;

    return true
  }

  descontouComissao(valor: any): boolean {
    if (valor < this.percentualMaxComissao.percMaxComissao) return true;

    return false;
  }

  formatarFormaPagamentoImpressao(opcaoOrcamentoCotacaoDto: OrcamentosOpcaoResponse, fPagto: FormaPagtoCriacao) {
    let retorno = { titulo: "", linhasPagto: [] };
    let texto: string = "";

    let pagtoS = opcaoOrcamentoCotacaoDto.formaPagto.filter(p => p.tipo_parcelamento == fPagto.tipo_parcelamento)[0];
    let pagtoBase = this.formaPagamento.filter(p => p.idTipoPagamento == fPagto.tipo_parcelamento)[0];

    if (pagtoS.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
      let total = 0;
      opcaoOrcamentoCotacaoDto.listaProdutos.forEach((x) => {
        let descReal = 100 * (x.precoLista - x.precoVenda) / x.precoLista;
        let precoBaseVenda = this.moedaUtils
          .formatarDecimal((x.precoListaBase * (1 - descReal / 100)) * x.qtde);
        total += precoBaseVenda;
      });
      let meio = pagtoBase.meios.filter(m => m.id == fPagto.op_av_forma_pagto)[0].descricao;

      retorno.titulo = texto = pagtoBase.tipoPagamentoDescricao + " em " + meio + " " + this.moedaUtils.formatarMoedaComPrefixo(total);
      if (!!fPagto.observacoesGerais) {
        retorno.linhasPagto.push(fPagto.observacoesGerais);
      }
    }
    if (pagtoS?.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      retorno.titulo = `${pagtoBase.tipoPagamentoDescricao} ${this.moedaUtils.formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.vlTotal)}`;
      retorno.linhasPagto.push(`${pagtoBase.tipoPagamentoDescricao} em ${pagtoS.c_pc_qtde.toString()} X de ${this.moedaUtils.formatarMoedaComPrefixo(pagtoS.c_pc_valor)}`);
      if (!!pagtoS.observacoesGerais) {
        retorno.linhasPagto.push(pagtoS.observacoesGerais);
      }
    }
    if (pagtoS?.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let meioEntrada = pagtoBase.meios.filter(m => m.id.toString() == fPagto.op_pce_entrada_forma_pagto)[0].descricao;
      let meioPrestacao = pagtoBase.meios.filter(m => m.id.toString() == fPagto.op_pce_prestacao_forma_pagto)[0].descricao;
      retorno.titulo = "Parcelado com entrada " + this.moedaUtils.formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.vlTotal);
      retorno.linhasPagto.push(`Entrada: ${meioEntrada} no valor de ${this.moedaUtils.formatarMoedaComPrefixo(fPagto.o_pce_entrada_valor)}`);
      retorno.linhasPagto.push(`Demais Prestações: ${meioPrestacao} em ${fPagto.c_pce_prestacao_qtde} X de ${this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pce_prestacao_valor)}`);
      retorno.linhasPagto.push(`Período entre Parcelas: ${fPagto.c_pce_prestacao_periodo} dias`);
      if (!!pagtoS.observacoesGerais) {
        retorno.linhasPagto.push(pagtoS.observacoesGerais);
      }
    }
    if (pagtoS?.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      let meioPrimPrest = pagtoBase.meios.filter(m => m.id.toString() == fPagto.op_pse_prim_prest_forma_pagto)[0].descricao;
      let meioPrestacao = pagtoBase.meios.filter(m => m.id.toString() == fPagto.op_pse_demais_prest_forma_pagto)[0].descricao;
      retorno.titulo = "Parcelado sem entrada " + this.moedaUtils.formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.vlTotal);
      retorno.linhasPagto.push(`1º Prestação: : ${meioPrimPrest} no valor de ${this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_prim_prest_valor)}`);
      retorno.linhasPagto.push(`vencendo após " + fPagto.c_pse_prim_prest_apos + " dias`);
      retorno.linhasPagto.push(`Demais Prestações: ${meioPrestacao} em ${fPagto.c_pse_demais_prest_qtde} X de ${this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_demais_prest_valor)}`);
      retorno.linhasPagto.push(`Período entre Parcelas: ${fPagto.c_pse_demais_prest_periodo} dias`);
      if (!!pagtoS.observacoesGerais) {
        retorno.linhasPagto.push(pagtoS.observacoesGerais);
      }
    }
    if (pagtoS?.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      let meio = pagtoBase.meios.filter(m => m.id.toString() == fPagto.op_pu_forma_pagto)[0].descricao;
      retorno.titulo = `Parcela única ${this.moedaUtils.formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.vlTotal)}`;
      retorno.linhasPagto.push(`${pagtoBase.tipoPagamentoDescricao} em ${meio} no valor de ${this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pu_valor)}`);
      retorno.linhasPagto.push(`vencendo após ${fPagto.c_pu_vencto_apos} dias`);
      if (!!pagtoS.observacoesGerais) {
        retorno.linhasPagto.push(pagtoS.observacoesGerais);
      }
    }
    if (pagtoS?.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      retorno.titulo = `${pagtoBase.tipoPagamentoDescricao} ${this.moedaUtils.formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.vlTotal)}`;
      retorno.linhasPagto.push(`${pagtoBase.tipoPagamentoDescricao} em ${pagtoS.c_pc_maquineta_qtde.toString()} X de ${this.moedaUtils.formatarMoedaComPrefixo(pagtoS.c_pc_maquineta_valor)}`);
      if (!!pagtoS.observacoesGerais) {
        retorno.linhasPagto.push(pagtoS.observacoesGerais);
      }
    }

    return retorno;
  }
}
