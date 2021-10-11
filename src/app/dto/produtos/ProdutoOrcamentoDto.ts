export class ProdutoOrcamentoDto{
    Fabricante: string;
    Produto: string;
    Fabricante_Nome: string;
    Descricao: string;
    Qtde: number | null;
    Preco_NF: number | null;
    CustoFinancFornecPrecoListaBase: number | null;
    Desc_Dado: number | null;
    Preco_Venda: number;
    TotalItem: number | null;
    TotalItemRA: number | null;

    VL_Lista: number;
    Obs: string;
    VlTotalItem: number | null;
    BlnTemRa: boolean;
    VlTotalRA: number;
    Comissao: number | null;
    AlterouValorRa: boolean | null;
    Alterou_Preco_Venda: boolean | null;
    //verificar a necessidade dessa variavel
    Qtde_estoque_total_disponivel: number | null;
    ProdutoPai: string
}