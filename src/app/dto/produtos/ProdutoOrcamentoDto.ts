export class ProdutoOrcamentoDto {
    id: number;
    idItemUnificado: number;
    idOpcaoPagto: number;
    fabricante: string;
    fabricanteNome: string;
    produto: string;
    descricao: string;
    precoLista: number | null;
    precoListaBase: number;
    coeficienteDeCalculo: number;
    precoNF: number | null;
    descDado: number | null;
    precoVenda: number;
    qtde: number | null;
    totalItem: number | null;
    alterouPrecoVenda: boolean | null;
    mostrarCampos: boolean = false;
    idOperacaoAlcadaDescontoSuperior: number;
    urlImagem: string;
}