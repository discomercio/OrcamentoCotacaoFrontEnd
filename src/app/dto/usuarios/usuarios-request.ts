export class UsuariosRequest {
    parceiro: string;
    vendedor: string;
    tipoUsuario: number;
    loja: string;
    ativo: number;
    pesquisa: string;
    pagina: number;
    qtdeItensPagina: number;
    ordenacaoAscendente: boolean;
    nomeColuna: string;
    parceiros: Array<string>;
    vendedores: Array<string>;
    stLoginBloqueadoAutomatico: boolean;
}