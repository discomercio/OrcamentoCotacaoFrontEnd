export class ConsultaGerencialOrcamentoRequest {
    lojas: Array<string>;
    vendedor: number;
    comParceiro: boolean;
    idParceiro: number;
    idVendedorParceiro: number;
    fabricante: string;
    grupo: string;
    dataCriacaoInicio: Date | string;
    dataCriacaoFim: Date | string;
    dataCorrente: Date | string;
    mensagemPendente: boolean;
    expirado: boolean;
    pagina: number;
    qtdeItensPagina: number;
    ordenacaoAscendente: boolean;
    nomeColunaOrdenacao: string;
    nomeLista: string;
    status: Array<number>;
    vendedorSelecionado: any;
    parceiroSelecionado:any;
    lojasSelecionadas:Array<string>;
}