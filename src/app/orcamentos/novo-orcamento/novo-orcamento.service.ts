import { Injectable, HostListener } from '@angular/core';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Parcelado } from 'src/app/dto/forma-pagto/parcelado';
import { PagtoOpcao } from 'src/app/dto/forma-pagto/pagto-opcao';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto = new OrcamentoCotacaoDto();
  public opcaoOrcamentoCotacaoDto: OrcamentoOpcaoDto = new OrcamentoOpcaoDto();
  public constantes: Constantes = new Constantes();
  public mostrarOpcoes: boolean;
  public qtdeProdutosOpcao: number = 0;
  public limiteQtdeProdutoOpcao: number = 12;
  public pageItens: number = 3;

  criarNovo() {
    this.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto = new Array<OrcamentoOpcaoDto>();
  }
  criarNovoOrcamentoItem() {
    this.opcaoOrcamentoCotacaoDto = new OrcamentoOpcaoDto();
    this.opcaoOrcamentoCotacaoDto.listaProdutos = new Array();

  }

  setarDados(clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto) {
    this.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }

  public moedaUtils: MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    if (this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length >= 0 &&
      !!this.opcaoOrcamentoCotacaoDto.listaProdutos)
      return this.opcaoOrcamentoCotacaoDto.VlTotal = this.moedaUtils.formatarDecimal(
        this.opcaoOrcamentoCotacaoDto.listaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.totalItem), 0));

  }
  public totalPedidoRA(): number {
    if (this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length >= 0 &&
      !!this.opcaoOrcamentoCotacaoDto.listaProdutos)
      return this.opcaoOrcamentoCotacaoDto.ValorTotalComRA = this.moedaUtils.formatarDecimal(
        this.opcaoOrcamentoCotacaoDto.listaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.totalItemRA), 0));

  }

  public calcularDesconto(valor: number, desconto: number) {
    let valorDescontado = valor * (1 - desconto / 100);
    return Number.parseFloat(valorDescontado.toFixed(2));
  }

  public calcularParcelas(valor: number, parcelas: number) {
    let parcelamento: number[] = new Array();
    for (let i = 1; i <= parcelas; i++) {
      let parcela: number = 0;
      // parcela = this.moedaUtils.formatarDecimal(valor / i);
      parcela = Math.round(((valor / i) + 0.001 + Number.EPSILON) * 100) / 100;
      parcelamento.push(parcela);
    }

    return parcelamento;
  }

  desconto: number = 3;
  atribuirOpcaoPagto(pagto: PagtoOpcao[], qtdeParcelas: number): PagtoOpcao[] {

    pagto.forEach(p => {
      if (p.incluir) {
        p.valores = new Array();
        if (p.codigo == this.constantes.COD_PAGTO_AVISTA) {
          p.valores.push(this.calcularDesconto(this.opcaoOrcamentoCotacaoDto.VlTotal, this.desconto));
        }
        if (p.codigo == this.constantes.COD_PAGTO_PARCELADO) {
          p.valores = this.calcularParcelas(this.opcaoOrcamentoCotacaoDto.VlTotal, qtdeParcelas);
        }
      }
    });

    return pagto;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
