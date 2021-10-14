import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';

export class OrcamentoCotacaoDto {
    ListaProdutos: ProdutoOrcamentoDto[];
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;    
    FormaPagto:string[];
    Observacoes:string;
}
