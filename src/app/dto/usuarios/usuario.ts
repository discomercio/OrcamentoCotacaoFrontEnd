export class Usuario {
    id: number = 0;
    nome: string = "";
    idVendedor: string = "";
    email: string = "";
    senha: string = "";
    idParceiro: string = "";
    parceiro: string = "";
    telefone: string = "";
    celular: string = "";
    ativo: boolean = false;
    permissoes: Array<string> = new Array();
    usuarioCadastro: string = "";
    dataCadastro: Date;
    usuarioUltimaAlteracao: string = "";
    dataUltimaAlteracao: Date;
    loja: string;
    vendedorResponsavel: string;
}

