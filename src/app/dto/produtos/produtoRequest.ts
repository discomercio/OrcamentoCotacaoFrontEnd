export class ProdutoRequest {
    loja: string;
    uf: string;
    tipoCliente: string;
    tipoParcela: string;
    qtdeParcelas: number;
    dataRefCoeficiente: Date|string;
    produtos:Array<string>;//para edição da opção
    idOpcao:number;//para edição da opção
    idOpcaoFormaPagto;//para edição da opção
}