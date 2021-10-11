import { ProdutoDto } from './ProdutoDto';

export class ProdutoCompostoDto {
    PaiFabricante: string;
    PaiFabricanteNome: string;
    PaiProduto: string;
    PaiDescricao:string;    
    Preco_total_Itens: number;
    Filhos: Array<ProdutoDto>;
}