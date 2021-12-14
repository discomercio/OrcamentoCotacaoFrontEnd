export class ProdutoDto {
    fabricante: string;
    fabricanteNome: string;
    produto: string;
    descricaoHtml: string;
    precoLista: number | null;
    estoque: number;
    alertas: string;
    qtdeMaxVenda: number = 0;
}
