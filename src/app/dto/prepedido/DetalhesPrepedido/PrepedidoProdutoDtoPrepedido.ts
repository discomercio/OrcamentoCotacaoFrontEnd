export class PrepedidoProdutoDtoPrepedido {
    Fabricante: string;
    Fabricante_Nome: string;
    Produto: string;
    Descricao: string;
    Obs: string;
    Qtde: number | null;
    Permite_Ra_Status: number;
    BlnTemRa: boolean;
    CustoFinancFornecPrecoListaBase: number | null;
    Preco_NF: number | null;
    Preco_Lista: number;
    Desc_Dado: number | null;
    Preco_Venda: number;
    VlTotalItem: number | null;
    VlTotalRA: number;
    Comissao: number | null;
    TotalItemRA: number | null;
    TotalItem: number | null;
    AlterouValorRa: boolean | null;
    Alterou_Preco_Venda: boolean | null;
    //verificar a necessidade dessa variavel
    Qtde_estoque_total_disponivel: number | null;
    ProdutoPai: string
    CustoFinancFornecCoeficiente : number |null;
  Preco_ListaBase: number;
  CoeficenteDeCalculo: number;
  mostrarCampos: boolean;
}
