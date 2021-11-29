export class Usuario {
    id: number = 0;
    nome: string = "";
    idVendedor:string="";
    email: string = "";
    senha: string = "";
    idParceiro:string="";
    telefone:string="";
    celular: string = "";
    ativo: boolean = false;
    tipoUsuario: number;
    usuarioCadastro:string = "";
    dataCadastro:Date;
    usuarioUltimaAlteracao:string = "";
    dataUltimaAlteracao:Date;
}
