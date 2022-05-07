import { ProdutoCatalogoImagem } from "./ProdutoCatalogoImagem";
import { ProdutoCatalogoItem } from "./ProdutoCatalogoItem";

export class ProdutoCatalogo{
    Id:string;
    linhaBusca:string;
    Codigo:string;
    Produto: string;
    Nome:string;
    Fabricante: string;
    Descricao:string;
    Ativo: boolean;
    campos: ProdutoCatalogoItem[];
    imagens: ProdutoCatalogoImagem[];
}
