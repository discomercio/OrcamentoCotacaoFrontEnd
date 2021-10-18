import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';
import { Parcelado } from '../forma-pagto/parcelado';
import { PagtoOpcao } from '../forma-pagto/pagto-opcao';

export class OrcamentoCotacaoDto {
    ListaProdutos: ProdutoOrcamentoDto[];
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;    
    FormaPagto:PagtoOpcao[];
    Observacoes:string;
}
