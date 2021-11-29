import { Injectable, HostListener } from '@angular/core';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Parcelado } from 'src/app/dto/forma-pagto/parcelado';
import { PagtoOpcao } from 'src/app/dto/forma-pagto/pagto-opcao';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto = new OrcamentoCotacaoDto();
  public opcoesOrcamentoCotacaoDto: OrcamentoOpcaoDto = new OrcamentoOpcaoDto();
  public constantes: Constantes = new Constantes();
  public mostrarOpcoes: boolean;

  criarNovo() {
    this.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto = new Array<OrcamentoOpcaoDto>();
  }
  criarNovoOrcamentoItem() {
    this.opcoesOrcamentoCotacaoDto = new OrcamentoOpcaoDto();
    this.opcoesOrcamentoCotacaoDto.ListaProdutos = new Array();

  }

  setarDados(clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto) {
    this.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }

  public moedaUtils: MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    if (this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length > 0)
      return this.opcoesOrcamentoCotacaoDto.VlTotalDestePedido = this.moedaUtils.formatarDecimal(
        this.opcoesOrcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItem), 0));

  }
  public totalPedidoRA(): number {
    if (this.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length > 0)
      return this.opcoesOrcamentoCotacaoDto.ValorTotalDestePedidoComRA = this.moedaUtils.formatarDecimal(
        this.opcoesOrcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItemRA), 0));

  }

  public calcularDesconto(valor: number, desconto: number) {
    let valorDescontado = valor * (1 - desconto / 100);
    return Number.parseFloat(valorDescontado.toFixed(2));
  }

  public calcularParcelas(valor: number, parcelas: number) {
    let parcelamento: number[] = new Array();

    for (let i = 1; i <= parcelas; i++) {
      let parcela: number = 0;
      parcela = i;
      let v: any = this.moedaUtils.formatarDecimal(valor / i);
      parcela = v;
      parcelamento.push(parcela);
    }

    return parcelamento;
  }

  desconto: number = 3;
  atribuirOpcaoPagto(pagto: PagtoOpcao[]): PagtoOpcao[] {

    pagto.forEach(p => {
      if (p.incluir) {
        p.valores = new Array();
        if (p.codigo == this.constantes.COD_PAGTO_AVISTA) {
          for (let i = 0; i < p.qtdeParcelas; i++) {
            p.valores.push(this.calcularDesconto(this.opcoesOrcamentoCotacaoDto.VlTotalDestePedido, this.desconto));
          }
        }
        if (p.codigo == this.constantes.COD_PAGTO_PARCELADO) {
          p.valores = this.calcularParcelas(this.opcoesOrcamentoCotacaoDto.VlTotalDestePedido, p.qtdeParcelas);
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
