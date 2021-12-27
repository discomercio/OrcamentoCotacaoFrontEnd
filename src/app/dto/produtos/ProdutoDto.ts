export class ProdutoDto {
    fabricante: string;
    fabricanteNome: string;
    produto: string;
    descricaoHtml: string;
    precoLista: number | null;
    coeficienteDeCalculo: number;
    estoque: number;
    alertas: string;
    qtdeMaxVenda: number = 0;
    descDado: number | null;
}
