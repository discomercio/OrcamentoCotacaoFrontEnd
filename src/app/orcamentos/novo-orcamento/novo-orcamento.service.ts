import { Injectable, HostListener } from '@angular/core';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { Observable } from 'rxjs';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor(telaDesktopService: TelaDesktopService,
    public mensagemService: MensagemService) { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto = new OrcamentoCotacaoDto();
  public opcaoOrcamentoCotacaoDto: OrcamentoOpcaoDto = new OrcamentoOpcaoDto();
  public constantes: Constantes = new Constantes();
  public mostrarOpcoes: boolean;
  public controleProduto: Array<string> = new Array();
  public limiteQtdeProdutoOpcao: number = 12;
  public pageItens: number = 3;
  public lstProdutosSelecionados: ProdutoOrcamentoDto[] = new Array();
  public coeficientes: Array<CoeficienteDto>;
  public siglaPagto: string;
  public qtdeParcelas: number;
  public formaPagamentosVisualizacao: Array<string> = new Array<string>();

  criarNovo() {
    this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto = new Array<OrcamentoOpcaoDto>();
  }
  criarNovoOrcamentoItem() {
    this.opcaoOrcamentoCotacaoDto = new OrcamentoOpcaoDto();
    this.opcaoOrcamentoCotacaoDto.listaProdutos = new Array();

  }

  setarDados(clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto) {
    this.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }

  public moedaUtils: MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    if (this.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length >= 0 &&
      !!this.opcaoOrcamentoCotacaoDto.listaProdutos) {
      return this.opcaoOrcamentoCotacaoDto.VlTotal = this.moedaUtils
        .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
          .reduce((sum, current) => sum + this.moedaUtils
            .formatarDecimal(current.totalItem), 0));
    }
  }

  public totalAVista(): number {
    return this.moedaUtils
      .formatarDecimal(this.opcaoOrcamentoCotacaoDto.listaProdutos
        .reduce((sum, current) => sum + this.moedaUtils
          .formatarDecimal((current.precoListaBase * (1 - current.descDado / 100)) * current.qtde), 0));
  }

  
  atribuirOpcaoPagto(lstFormaPagto: FormaPagtoCriacao[], formaPagamento: FormaPagto[]) {
    this.opcaoOrcamentoCotacaoDto.formaPagto = lstFormaPagto;

    //vamos montar o texto para mostrar a forma de pagamento
    lstFormaPagto.forEach((fp) => {
      let pagto = formaPagamento.filter(f => f.idTipoPagamento == fp.tipo_parcelamento)[0];
      let texto: string;
      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
        texto = pagto.tipoPagamentoDescricao + " " + this.moedaUtils.formatarMoedaComPrefixo(this.totalAVista());
      }
      if (pagto.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
        texto = pagto.tipoPagamentoDescricao + " em " + fp.c_pc_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp.c_pc_valor);
      }
      this.formaPagamentosVisualizacao.push(texto);
    })
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

    this.coeficientes = coeficientes;
    this.qtdeParcelas = qtdeParcelas;

    this.lstProdutosSelecionados.forEach(x => {
      let coeficiente = this.coeficientesParaCalculo.filter(c => c.Fabricante == x.fabricante)[0];
      x.precoLista = this.moedaUtils.formatarDecimal(x.precoListaBase * coeficiente.Coeficiente);
      x.precoVenda = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda) : x.precoLista;
      x.descDado = x.alterouPrecoVenda ? (x.precoLista - x.precoVenda) * 100 / x.precoLista : x.descDado;
      x.precoNF = x.precoVenda;
      x.coeficienteDeCalculo = coeficiente.Coeficiente;
      x.totalItem = x.alterouPrecoVenda ? this.moedaUtils.formatarDecimal(x.precoVenda * x.qtde) : this.moedaUtils.formatarDecimal(x.precoLista * x.qtde);
    });

    this.totalPedido();
  }



  get coeficientesParaCalculo(): Array<CoeficienteDto> {
    let coeficientesParaCalculo: CoeficienteDto[] = new Array<CoeficienteDto>();
    this.lstFabricantesDisctint.forEach(x => {
      let filtro = this.coeficientes.filter(c => c.Fabricante == x && c.TipoParcela == this.siglaPagto && c.QtdeParcelas == this.qtdeParcelas)[0];
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
