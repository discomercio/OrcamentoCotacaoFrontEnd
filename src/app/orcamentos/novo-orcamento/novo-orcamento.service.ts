import { Injectable } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto;

criarNovo(){
  this.orcamentoCotacaoDto = new OrcamentoCotacaoDto();
  this.orcamentoCotacaoDto.ListaProdutos = new Array();
}

  setarDados(clienteOrcamentoCotacaoDto:ClienteOrcamentoCotacaoDto){
    let orcamento = this.orcamentoCotacaoDto;
    orcamento.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }

  public moedaUtils : MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    return this.orcamentoCotacaoDto.VlTotalDestePedido = this.moedaUtils.formatarDecimal(
      this.orcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItem), 0));

  }
  public totalPedidoRA(): number {
    let v =  this.orcamentoCotacaoDto.ValorTotalDestePedidoComRA = this.moedaUtils.formatarDecimal(
      this.orcamentoCotacaoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItemRA), 0));

      return v;
  }
}
