export class Filtro {
    Origem: string;
    Status: string[];
    Nome_numero: string;
    Vendedor: string;
    Parceiro: string;
    IdIndicadorVendedor:number;
    VendedorParceiro:string;
    Loja: string;
    Mensagem: string;
    DtInicio: Date;
    DtFim: Date;
    DtInicioExpiracao:Date;
    DtFimExpiracao:Date;

    pagina: number;
    qtdeItensPagina: number;
    nomeColunaOrdenacao: string;
    ordenacaoAscendente: boolean;
}