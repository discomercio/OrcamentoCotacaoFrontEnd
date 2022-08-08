export class DetalhesFormaPagamentos {
    FormaPagto: string[];
    InfosAnaliseCredito: string;
    StatusPagto: string;
    CorStatusPagto: string;
    VlTotalFamilia: number;
    VlPago: number;
    VlDevolucao: number;
    VlPerdas: number | null;
    SaldoAPagar: number | null;
    AnaliseCredito: string;
    CorAnalise: string;
    DataColeta: Date | string | null;
    Transportadora: string;
    VlFrete: number;

}
