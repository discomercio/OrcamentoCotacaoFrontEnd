import { Injectable, HostListener } from '@angular/core';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { Observable } from 'rxjs';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { PercMaxDescEComissaoResponseViewModel } from 'src/app/dto/percentual-comissao';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor(telaDesktopService: TelaDesktopService,
    public mensagemService: MensagemService) { }

  public orcamentoCotacaoDto: OrcamentoCotacaoResponse = new OrcamentoCotacaoResponse();
  public opcaoOrcamentoCotacaoDto: OrcamentosOpcaoResponse = new OrcamentosOpcaoResponse();
  public constantes: Constantes = new Constantes();
  public mostrarOpcoes: boolean;
  public controleProduto: Array<string> = new Array();
  public limiteQtdeProdutoOpcao: number = 12;
  public pageItens: number = 3;
  public lstProdutosSelecionados: ProdutoOrcamentoDto[] = new Array();
  public coeficientes: Array<CoeficienteDto>;
  public siglaPagto: string;
  public qtdeParcelas: number;
  public configValidade: ValidadeOrcamento;

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

  }

  setarDados(ClienteOrcamentoCotacao: ClienteOrcamentoCotacaoDto) {
    this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = ClienteOrcamentoCotacao;
  }

  percentualMaxComissao: PercMaxDescEComissaoResponseViewModel;
  setarPercentualComissao() {
    if (this.percentualMaxComissao)
      this.opcaoOrcamentoCotacaoDto.percRT = this.percentualMaxComissao.percMaxComissao;
  }

  public moedaUtils: MoedaUtils = new MoedaUtils();
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
    let totalVista = this.moedaUtils
      .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
        .reduce((sum, current) => sum + this.moedaUtils
          .formatarDecimal((current.precoListaBase * (1 - current.descDado / 100)) * current.qtde), 0));

    return totalVista;
  }


  atribuirOpcaoPagto(lstFormaPagto: FormaPagtoCriacao[], formaPagamento: FormaPagto[]) {
    this.opcaoOrcamentoCotacaoDto.formaPagto = lstFormaPagto;
    this.formaPagamento = formaPagamento;
    // //vamos montar o texto para mostrar a forma de pagamento
    // lstFormaPagto.forEach((fp) => {
    //   let pagto = formaPagamento.filter(f => f.idTipoPagamento == fp.tipo_parcelamento)[0];
    //   let texto: string;
    //   if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
    //     texto = pagto.tipoPagamentoDescricao + " " + this.moedaUtils.formatarMoedaComPrefixo(this.totalAVista());
    //   }
    //   if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
    //     texto = pagto.tipoPagamentoDescricao + " em " + fp.c_pc_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp.c_pc_valor);
    //   }
    // })
  }

  formaPagamento: FormaPagto[];
  formatarFormaPagamento(opcaoOrcamentoCotacaoDto: OrcamentosOpcaoResponse, fPagto: FormaPagtoCriacao) {
    let texto: string = "";

    opcaoOrcamentoCotacaoDto.formaPagto.some((fp) => {

      let pagto = this.formaPagamento.filter(f => f.idTipoPagamento == fPagto.tipo_parcelamento)[0];

      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
        let valorTotalAvista = this.moedaUtils
          .formatarMoedaComPrefixo(opcaoOrcamentoCotacaoDto.listaProdutos
            .reduce((sum, current) => sum + this.moedaUtils
              .formatarDecimal((current.precoListaBase * (1 - current.descDado / 100)) * current.qtde), 0));
        let meio = pagto.meios.filter(m => m.id.toString() == fPagto.op_av_forma_pagto)[0].descricao;
        texto = pagto.tipoPagamentoDescricao + " em " + meio + " " + valorTotalAvista;
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
  teste: string = "texto com <br> quebra de linha";
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
      x.precoLista = this.moedaUtils.formatarDecimal(x.precoListaBase * coeficiente.Coeficiente);
      x.precoVenda = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda) : x.precoLista;
      x.descDado = x.alterouPrecoVenda ? (x.precoLista - x.precoVenda) * 100 / x.precoLista : x.descDado;
      x.precoNF = x.precoVenda;
      x.coeficienteDeCalculo = coeficiente.Coeficiente;
      x.totalItem = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda * x.qtde) : this.moedaUtils.formatarDecimal(x.precoLista * x.qtde);
    });
    
    this.calcularPercentualComissao();
    
  }

  calcularPercentualComissao() {
    let totalSemDesc = this.moedaUtils
      .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
        .reduce((sum, current) => sum + this.moedaUtils
          .formatarDecimal((current.precoLista) * current.qtde), 0));

    let totalComDesc = this.totalPedido();

    let descMedio = (((totalSemDesc - totalComDesc) / totalSemDesc) * 100);
    /*No caso de vendedor interno sem parceiro
    
    */


    if (descMedio > (this.percentualMaxComissao.percMaxComissaoEDesconto - this.percentualMaxComissao.percMaxComissao)) {
      let descontarComissao = this.moedaUtils.formatarDecimal(this.percentualMaxComissao.percMaxComissao - descMedio);

      if (descontarComissao != 0) {
        let descMax = this.percentualMaxComissao.percMaxComissaoEDesconto - this.percentualMaxComissao.percMaxComissao;
        this.moedaUtils.formatarDecimal(this.opcaoOrcamentoCotacaoDto.percRT = this.percentualMaxComissao.percMaxComissao - (descMedio - descMax));
      }
    }
    else {
      this.moedaUtils.formatarDecimal(this.opcaoOrcamentoCotacaoDto.percRT = this.percentualMaxComissao.percMaxComissao);
    }

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
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
