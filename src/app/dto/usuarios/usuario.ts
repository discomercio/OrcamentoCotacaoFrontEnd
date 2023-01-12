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
    ativo: boolean = true;
    permissoes: Array<string> = new Array();
    permissoesDescricao: Array<string> = new Array();
    usuarioCadastro: string = "";
    dataCadastro: Date;
    usuarioUltimaAlteracao: string = "";
    dataUltimaAlteracao: Date;
    loja: string;
    lojas: string[];
    vendedorResponsavel: string;
    tipoUsuario: number;
    unidadeNegocio: string;
    StLoginBloqueadoAutomatico: boolean = false;
}

