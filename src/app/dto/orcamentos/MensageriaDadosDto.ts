import { MensageriaDto } from '../mensageria/mensageria';

export class MensageriaDadosDto {
    public idOrcamentoCotacao: number;
    public idUsuarioRemetente: string;
    public idUsuarioDestinatario: string;
    public idTipoUsuarioContextoRemetente: string;
    public idTipoUsuarioContextoDestinatario: string;
  
    listaMensagens: MensageriaDto[];
}
