import { ProdutoDto } from './ProdutoDto';

export class ProdutoCompostoDto {
    paiFabricante: string;
    paiFabricanteNome: string;
    paiProduto: string;
    paiDescricao:string;    
    paiPrecoTotal: number;
    filhos: Array<ProdutoDto>;
}