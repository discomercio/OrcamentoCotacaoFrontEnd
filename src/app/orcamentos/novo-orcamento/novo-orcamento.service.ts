import { Injectable, HostListener } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { OpcoesOrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { Parcelado } from 'src/app/dto/forma-pagto/parcelado';
import { PagtoOpcao } from 'src/app/dto/forma-pagto/pagto-opcao';
import { Constantes } from 'src/app/utilities/constantes';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto;
  public opcoesOrcamentoCotacaoDto: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  public constantes: Constantes = new Constantes();

  criarNovo() {
    this.opcoesOrcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    this.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto = new Array<OrcamentoCotacaoDto>();
  }
  criarNovoOrcamentoItem() {
    this.orcamentoCotacaoDto = new OrcamentoCotacaoDto();
    this.orcamentoCotacaoDto.ListaProdutos = new Array();

  }

  setarDados(clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto) {
    this.opcoesOrcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }

  public moedaUtils: MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    if (this.orcamentoCotacaoDto != undefined)
      return this.orcamentoCotacaoDto.VlTotalDestePedido = this.moedaUtils.formatarDecimal(
        this.orcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItem), 0));

  }
  public totalPedidoRA(): number {
    if (this.orcamentoCotacaoDto != undefined)
      return this.orcamentoCotacaoDto.ValorTotalDestePedidoComRA = this.moedaUtils.formatarDecimal(
        this.orcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItemRA), 0));

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
      let v:any = this.moedaUtils.formatarDecimal(valor / i);
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
            p.valores.push(this.calcularDesconto(this.orcamentoCotacaoDto.VlTotalDestePedido, this.desconto));
          }
        }
        if (p.codigo == this.constantes.COD_PAGTO_PARCELADO) {
          p.valores = this.calcularParcelas(this.orcamentoCotacaoDto.VlTotalDestePedido, p.qtdeParcelas);
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
