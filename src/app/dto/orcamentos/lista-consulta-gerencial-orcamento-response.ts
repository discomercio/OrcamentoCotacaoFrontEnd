import { ConsultaGerencialOrcamentoResponse } from "./consulta-gerencial-orcamento-response";

export class ListaConsultaGerencialOrcamentoResponse{
    lstConsultaGerencialOrcamentoResponse:Array<ConsultaGerencialOrcamentoResponse>;
    qtdeRegistros:number;
    Sucesso:boolean;
    Mensagem:string;
}