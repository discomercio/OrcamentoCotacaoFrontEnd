import { ProdutoCatalogoCampo } from "./ProdutoCatalogoCampo";
import { ProdutoCatalogoImagem } from "./ProdutoCatalogoImagem";

export class ProdutoCatalogo{
    Id:string;
    linhaBusca:string;
    Codigo:string;
    Produto: string;
    Nome:string;
    Fabricante: string;
    Descricao:string;
    Ativo:string;
    campos: ProdutoCatalogoCampo[];
    imagens: ProdutoCatalogoImagem[];
}