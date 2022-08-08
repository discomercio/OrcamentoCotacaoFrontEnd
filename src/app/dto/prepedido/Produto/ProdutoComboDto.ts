import { ProdutoDto } from './ProdutoDto';
import { ProdutoCompostoDto } from './ProdutoCompostoDto';

export class ProdutoComboDto {
    ProdutoDto: ProdutoDto[];
    ProdutoCompostoDto: ProdutoCompostoDto[];
}
