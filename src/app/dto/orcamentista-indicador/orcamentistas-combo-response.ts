import { OrcamentistaComboResponse } from "./orcamentista-combo-response";

export class OrcamentistasComboResponse{
    parceiros:Array<OrcamentistaComboResponse>;
    Sucesso:boolean;
    Mensagem:string;
}