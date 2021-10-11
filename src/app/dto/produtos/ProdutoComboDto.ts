import { ProdutoDto } from './ProdutoDto';
import { ProdutoCompostoDto } from './produtoCompostoDto';

export class ProdutoComboDto {
    ProdutoDto: ProdutoDto[];
    ProdutoCompostoDto: ProdutoCompostoDto[];
}