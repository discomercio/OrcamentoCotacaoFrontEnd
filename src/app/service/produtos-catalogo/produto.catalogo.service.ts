import { environment } from "src/environments/environment";
import { ProdutoCatalogo } from "src/app/dto/produtos-catalogo/ProdutoCatalogo";
import { ProdutoCatalogoItem } from "src/app/dto/produtos-catalogo/ProdutoCatalogoItem";
import { ProdutoCatalogoPropriedade } from "src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade";
import { ProdutoCatalogoPropriedadeOpcao } from "src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao";
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProdutoCatalogoFabricante } from "src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante";
import { ProdutoCatalogoItemProdutosAtivosDados } from "src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos";
import { ProdutoCatalogoImagem } from "src/app/dto/produtos-catalogo/ProdutoCatalogoImagem";
import { DataType } from "src/app/dto/produtos-catalogo/DataType";
import { ProdutoCatalogoPropriedadeOpcaoResponse } from "src/app/dto/produtos-catalogo/produtoCatalogoPropriedadeOpcaoResponse";
import { ProdutoCalculadoraVrfRequestViewModel } from "src/app/dto/produtos-catalogo/ProdutoCalculadoraVrfRequestViewModel";

@Injectable({
    providedIn: "root",
})
export class ProdutoCatalogoService {


    constructor(private http: HttpClient, private env: environment) {
        this.urlUpload = `${this.env.apiUrl()}produtocatalogo/imagem`;
        this.imgUrl = `${this.env.imgUrl()}`;
    }

    public urlUpload: string;
    public imgUrl: string;

    buscarTodosProdutos(): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.env.apiUrl()}produtocatalogo`
        );
    }

    buscarDadosImagemPorProduto(produto): Observable<ProdutoCatalogoImagem[]> {
        return this.http.get<ProdutoCatalogoImagem[]>(
            `${this.env.apiUrl()}produtocatalogo/imagem/${produto}`
        );
    }

    buscarProdutosAtivos(): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.env.apiUrl()}produtocatalogo/ativos`
        );
    }

    buscarPorCodigo(codigo): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.env.apiUrl()}produtocatalogo/codigo/${codigo}`
        );
    }

    buscarProdutoDetalhe(id: any): Observable<ProdutoCatalogo> {
        return this.http.get<ProdutoCatalogo>(
            `${this.env.apiUrl()}produtocatalogo/${id}/detalhes`
        );
    }

    buscarProdutoPropriedades(id: string): Observable<ProdutoCatalogoItem> {
        return this.http.get<ProdutoCatalogoItem>(
            `${this.env.apiUrl()}produto/itens/${id}`
        );
    }

    buscarProdutoPropriedadesOpcoes(
        id: string
    ): Observable<ProdutoCatalogoItem> {
        return this.http.get<ProdutoCatalogoItem>(
            `${this.env.apiUrl()}produto/opcoes/${id}`
        );
    }

    excluirProduto(id: string): Observable<boolean> {
        return this.http.delete<boolean>(
            `${this.env.apiUrl()}produtocatalogo/${id}`
        );
    }

    criarProduto(formData: FormData): Observable<any> {
        return this.http.post<any>(
            `${this.env.apiUrl()}produtocatalogo/criar`,
            formData
        );
    }

    criarProdutoCatalogoItem(produtoCatalogoItem: any): Observable<any> {
        return this.http.post<any>(
            `${this.env.apiUrl()}produtocatalogo/item`,
            produtoCatalogoItem
        );
    }

    atualizarProduto(formData: FormData): Observable<any> {
        return this.http.put<any>(
            `${this.env.apiUrl()}produtocatalogo`,
            formData
        );
    }

    excluirImagem(idProduto: string, idImagem: string): Observable<string> {
        return this.http.delete<string>(
            `${this.env.apiUrl()}produtocatalogo/imagem?idProduto=${idProduto}&idImagem=${idImagem}`
        );
    }

    /* Propriedades do Produto */
    buscarPropriedades(): Observable<ProdutoCatalogoPropriedade[]> {
        return this.http.get<ProdutoCatalogoPropriedade[]>(
            `${this.env.apiUrl()}produto/propriedades`
        );
    }

    buscarPropriedadesProdutosAtivos(): Observable<
        ProdutoCatalogoItemProdutosAtivosDados[]
    > {
        return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.env.apiUrl()}produto/listar-produtos-propriedades-ativos`
        );
    }

    buscarPropriedadesProdutoAtivo(
        idProduto: number,
        propriedadeOculta: boolean,
        propriedadeOcultaItem: boolean
    ): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
        return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.env.apiUrl()}produto/buscar-produtos-opcoes-ativos/${idProduto}&${propriedadeOculta}&${propriedadeOcultaItem}`
        );
    }

    buscarPropriedadesEOpcoesProdutosAtivos(): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.env.apiUrl()}produto/listar-propriedades-opcoes-produtos-ativos`
        );
    }

    /* Propriedades do Produto */
    buscarFabricantes(): Observable<ProdutoCatalogoFabricante[]> {
        return this.http.get<ProdutoCatalogoFabricante[]>(
            `${this.env.apiUrl()}produto/fabricantes`
        );
    }

    buscarOpcoes(): Observable<ProdutoCatalogoPropriedadeOpcao[]> {
        return this.http.get<ProdutoCatalogoPropriedadeOpcao[]>(
            `${this.env.apiUrl()}produto/opcoes`
        );
    }

    buscarPropriedadesPorId(
        id: number
    ): Observable<ProdutoCatalogoPropriedade> {
        return this.http.get<ProdutoCatalogoPropriedade>(
            `${this.env.apiUrl()}produtocatalogo/propriedades/${id}`
        );
    }

    criarPropriedades(produto: ProdutoCatalogoPropriedade): Observable<any> {
        return this.http.post<any>(
            `${this.env.apiUrl()}produtocatalogo/propriedades`,
            produto
        );
    }

    atualizarPropriedades(produto: ProdutoCatalogoPropriedade): Observable<ProdutoCatalogoPropriedadeOpcaoResponse> {
        return this.http.put<ProdutoCatalogoPropriedadeOpcaoResponse>(
            `${this.env.apiUrl()}produtocatalogo/propriedades`,
            produto
        );
    }

    listarProdutosPropriedadesAtivos(
        request:ProdutoCalculadoraVrfRequestViewModel
    ): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
        // return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(
        //     `${this.env.apiUrl()}produtocatalogo/listarProdutosCatalogosParaCalculadora`
        // );
        return this.http.post<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.env.apiUrl()}produtocatalogo/listar-produtos-propriedades`, request
        );
    }

    buscarProdutosAtivosLista(): Observable<any> {
        return this.http.get<any>(
            `${this.env.apiUrl()}produto/listar-produtos-ativos`
        );
    }

    buscarDataTypes(): Observable<Array<DataType>> {
        return this.http.get<Array<DataType>>(`${this.env.apiUrl()}produtocatalogo/buscarDataTypes`);
    }

    buscarTipoPropriedades():Observable<Array<any>>{
        return this.http.get<Array<any>>(`${this.env.apiUrl()}produtocatalogo/buscarTipoPropriedades`);
    }
}
