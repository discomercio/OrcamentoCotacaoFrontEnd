import { Injectable } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { OpcoesOrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto;
  public opcoesOrcamentoCotacaoDto: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();

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
}
