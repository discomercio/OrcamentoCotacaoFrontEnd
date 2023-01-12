import { UsuarioPorListaLojaResponse } from "./usuario-por-lista-loja-response";

export class UsuariosPorListaLojasResponse{
    usuarios:Array<UsuarioPorListaLojaResponse>;
    Sucesso:boolean;
    Mensagem:string;
}