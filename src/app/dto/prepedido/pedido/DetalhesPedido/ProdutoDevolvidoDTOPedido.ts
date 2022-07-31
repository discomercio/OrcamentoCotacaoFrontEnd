export class ProdutoDevolvidoDtoPedido {
    /*
     * data
     * hora
     * qtde = unidade
     * produto = código do produto
     * descrição do produto
     * motivo se tiver motivo
     * numero da nota fiscal
     */

    Data: Date | string | null;
    Hora: string;
    Qtde: number | null;
    CodProduto: string;
    DescricaoProduto: string;
    Motivo: string;
    NumeroNF: number;
}
