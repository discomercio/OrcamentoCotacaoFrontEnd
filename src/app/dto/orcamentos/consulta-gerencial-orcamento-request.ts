export class ConsultaGerencialOrcamentoRequest {
    lojas: Array<string>;
    vendedor: string;
    comParceiro: boolean;
    idParceiro: number;
    idVendedorParceiro: number;
    fabricante: string;
    grupo: string;
    dataCriacaoInicio: Date | string;
    dataCriacaoFim: Date | string;
    dataCorrente: Date | string;
    pagina:number;
    qtdeItensPagina:number;
}