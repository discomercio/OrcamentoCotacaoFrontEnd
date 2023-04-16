import { ProdutoCatalogoResponse } from "./ProdutoCatalogoResponse";

export class ListaProdutoCatalogoListarResponse{
    listaProdutoCatalogoResponse:Array<ProdutoCatalogoResponse>;
    qtdeRegistros:number;
    Sucesso:boolean;
    Mensagem:string;
}