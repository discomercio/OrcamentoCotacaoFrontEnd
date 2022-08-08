export class ParamsBuscaPrepedido {

    constructor() { }

    //campos do formulário
    public clienteBusca: string = "";
    public numeroPrePedido: string = "";
    public dataInicial: string = "";
    public dataFinal: string = "";
    public tipoBuscaAndamento: boolean = true;
    public tipoBuscaPedido: boolean = true;
    public tipoBuscaPedidoExcluidos: boolean = false;
}
