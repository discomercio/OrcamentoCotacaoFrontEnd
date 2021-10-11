import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';

export class OrcamentoCotacaoDto {
    ClienteOrcamentoCotacaoDto:ClienteOrcamentoCotacaoDto;
    ListaProdutos: ProdutoOrcamentoDto[];
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;
}
