import { ProdutoFilhoDto } from './produto-filhoDto';

export class ProdutoCompostoDto {
    paiFabricante: string;
    paiFabricanteNome: string;
    paiProduto: string;
    paiDescricao:string;    
    paiPrecoTotal: number;
    filhos: Array<ProdutoFilhoDto>;
}