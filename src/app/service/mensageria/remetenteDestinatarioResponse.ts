export class RemetenteDestinatarioResponse {
    idOrcamentoCotacao: number;
    idUsuarioRemetente: number;
    idTipoUsuarioContextoRemetente: number;
    idUsuarioDestinatario: number;
    idTipoUsuarioContextoDestinatario: number;
    donoOrcamento: boolean;
    status: number;
    validade: string;
    dataMaxTrocaMsg: Date;
}