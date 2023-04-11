export class Filtro {
    Origem: string;
    Vendedor: string;
    Parceiro: string;
    IdIndicadorVendedor:number;
    VendedorParceiro:string;
    Loja: string;

    Status: string[];
    Nome_numero: string;
    Vendedores: string[];
    Parceiros: string[];
    VendedorParceiros: string[];
    Mensagem: string;
    DtInicio: Date;
    DtFim: Date;
    DtInicioExpiracao:Date;
    DtFimExpiracao:Date;
    Exportar: boolean;

    pagina: number;
    qtdeItensPagina: number;
    nomeColunaOrdenacao: string;
    ordenacaoAscendente: boolean;
}