export class ProdutoDto {
    Fabricante: string;
    Fabricante_Nome: string;
    Produto: string;
    Descricao_html: string;
    Preco_lista: number | null;
    Estoque: number;
    Alertas: string;
    Qtde_Max_Venda: number = 0;
    UnitarioVendavel: boolean;
}
