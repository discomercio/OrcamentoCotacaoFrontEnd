import { ProdutoDto } from './ProdutoDto';
import { ProdutoCompostoDto } from './produtoCompostoDto';

export class ProdutoComboDto {
    produtosSimples: ProdutoDto[] = [];
    produtosCompostos: ProdutoCompostoDto[] = [];
}