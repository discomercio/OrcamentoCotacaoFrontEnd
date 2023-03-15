import { GrupoSubgrupoProdutoResponse } from "./grupo-subgrupo-produto-response";

export class ListaGruposSubgruposProdutosResponse{
    listaGruposSubgruposProdutos:Array<GrupoSubgrupoProdutoResponse>;
    Mensagem:string;
    Sucesso:boolean;
}