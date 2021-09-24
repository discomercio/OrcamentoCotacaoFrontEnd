import { ProdutoFilhoDto } from './produtoFilhoDto';

export class ProdutoCompostoDto {
    PaiFabricante: string;
    PaiFabricanteNome: string;
    PaiProduto: string;
    Preco_total_Itens: number;
    Filhos: Array<ProdutoFilhoDto>;
}