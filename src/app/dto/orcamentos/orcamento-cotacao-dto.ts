import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';
import { PagtoOpcao } from '../forma-pagto/pagto-opcao';

export class OrcamentoOpcaoDto {
    ListaProdutos: ProdutoOrcamentoDto[];
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;    
    FormaPagto:PagtoOpcao[];
    Observacoes:string;
}
