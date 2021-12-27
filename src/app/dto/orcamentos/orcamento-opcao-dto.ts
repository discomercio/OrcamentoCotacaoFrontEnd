import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';
import { PagtoOpcao } from '../forma-pagto/pagto-opcao';

export class OrcamentoOpcaoDto {
    idOrcamento:number;
    listaProdutos: ProdutoOrcamentoDto[];
    valorTotalDestePedidoComRA: number | null;
    vlTotalDestePedido: number | null;    
    formaPagto:PagtoOpcao[];
    observacoes:string;
}
