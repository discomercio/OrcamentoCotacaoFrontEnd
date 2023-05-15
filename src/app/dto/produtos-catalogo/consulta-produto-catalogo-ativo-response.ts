import { ConsultaProdutoCatalogoPropriedadeResponse } from "./consulta-produtocatalogo-propriedade-response";

export class ConsultaProdutoCatalogoAtivoResponse{
    fabricante:string;
    fabricanteNome:string;
    produto:string;
    produtoNome:string;
    produtoDescricaoCompleta:string;
    imagemCaminho:string;
    listaPropriedades:Array<ConsultaProdutoCatalogoPropriedadeResponse>;
    Sucesso:boolean;
    Mensagem:string;
}