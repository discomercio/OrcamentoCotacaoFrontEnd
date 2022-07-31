export class PedidoProdutosDtoPedido {
    Fabricante: string;
    Produto: string;
    Descricao: string;
    Qtde: number | null;
    Faltando: number | null;
    CorFaltante: string;
    Preco_NF: number | null;
    Preco_Lista: number;
    Desc_Dado: number | null;
    Preco_Venda: number;
    VlTotalItem: number | null;
    VlTotalItemComRA: number | null;
    Comissao: number | null;
}
