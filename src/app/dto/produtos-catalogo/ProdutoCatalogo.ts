import { ProdutoCatalogoCampo } from "./ProdutoCatalogoCampo";
import { ProdutoCatalogoImagem } from "./ProdutoCatalogoImagem";

export class ProdutoCatalogo{
    id:string;
    nome:string;
    descricao:string;
    ativo:string;
    campos: ProdutoCatalogoCampo[];
    imagens: ProdutoCatalogoImagem[];
}