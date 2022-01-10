export class ProdutoOrcamentoDto {
    fabricante: string;
    fabricanteNome: string;
    produto: string;
    descricao: string;
    precoLista: number | null;
    coeficienteDeCalculo: number;
    precoNF: number | null;
    descDado: number | null;
    precoVenda: number;
    qtde: number | null;
    totalItem: number | null;
    totalItemRA: number | null;
    alterouValorRa: boolean | null;
    alterouPrecoVenda: boolean | null;
    mostrarCampos:boolean = false;
    // VL_Lista: number;
    // Obs: string;
    // VlTotalItem: number | null;
    // BlnTemRa: boolean;
    // VlTotalRA: number;
    // Comissao: number | null;


    //verificar a necessidade dessa variavel
    // Qtde_estoque_total_disponivel: number | null;
    ProdutoPai: string
}