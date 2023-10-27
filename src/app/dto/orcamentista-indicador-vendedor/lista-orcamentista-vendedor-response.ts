import { OrcamentistaVendedorResponse } from "./orcamentista-vendedor-response";

export class ListaOrcamentistaVendedorResponse{
    listaOrcamentistaVendedor:Array<OrcamentistaVendedorResponse>
    qtdeRegistros:number;
    Sucesso:boolean;
    Mensagem:string;
}