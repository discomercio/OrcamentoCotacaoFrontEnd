export class Filtro {
    Origem: string;
    Vendedor: string;
    Parceiro: string;
    IdIndicadorVendedor: number;
    VendedorParceiro: string;
    Loja: string;
    Lojas: string[];
    Status: string[];
    Nome_numero: string;
    Vendedores: string[];
    Parceiros: string[];
    VendedorParceiros: string[];
    Mensagem: string;
    DtInicio: Date | string;
    DtFim: Date | string;
    DtInicioExpiracao: Date | string;
    DtFimExpiracao: Date | string;
    Exportar: boolean;

    pagina: number;
    qtdeItensPagina: number;
    nomeColunaOrdenacao: string;
    ordenacaoAscendente: boolean;

    idBaseBusca: string;

    OpcoesOrcamento: string;
    ComIndicador: boolean;
    Fabricantes: string[];
    Categorias: string[];

    LojaLogada: string;
}