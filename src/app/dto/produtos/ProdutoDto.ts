export class ProdutoDto {
    fabricante: string;
    fabricante_Nome: string;
    produto: string;
    descricaoHtml: string;
    precoLista: number | null;
    precoListaBase:number;
    coeficienteDeCalculo: number;
    estoque: number;
    alertas: string;
    qtdeMaxVenda: number = 0;
    descDado: number | null;
    qtde:number;
    codGrupoSubgrupo:string;
    descricaoGrupoSubgrupo:string;
    capacidade:number;
    ciclo:string;
    cicloDescricao:string;
    unitarioVendavel:boolean;
}
