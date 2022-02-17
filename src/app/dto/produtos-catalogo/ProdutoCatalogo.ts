import { ProdutoCatalogoCampo } from "./ProdutoCatalogoCampo";
import { ProdutoCatalogoImagem } from "./ProdutoCatalogoImagem";

export class ProdutoCatalogo{
    Id:string;
    Codigo:string;
    Nome:string;
    Descricao:string;
    Ativo:string;
    campos: ProdutoCatalogoCampo[];
    imagens: ProdutoCatalogoImagem[];
}