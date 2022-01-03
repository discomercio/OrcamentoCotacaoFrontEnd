import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';
import { PagtoOpcao } from '../forma-pagto/pagto-opcao';

export class OrcamentoOpcaoDto {
    idOrcamento:number;
    listaProdutos: ProdutoOrcamentoDto[];
    ValorTotalComRA: number | null;
    VlTotal: number | null;    
    formaPagto:PagtoOpcao[];
    observacoes:string;
}
