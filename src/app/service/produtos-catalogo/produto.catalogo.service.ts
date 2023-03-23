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
import { ProdutosAtivosRequestViewModel } from "src/app/dto/produtos-catalogo/ProdutosAtivosRequestViewModel";
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { ProdutosGruposResponse } from "src/app/dto/produtos/produtos-grupos-response";
import { CadastroProdutoCatalogoResponse } from "src/app/dto/produtos-catalogo/cadastro-produto-catalogo-response";

@Injectable({
    providedIn: "root",
})
export class ProdutoCatalogoService {


    constructor(
        private http: HttpClient,
        private appSettingsService: AppSettingsService) {
        this.urlUpload = `${this.appSettingsService.config.apiUrl}produtocatalogo/imagem`;
        this.imgUrl = `${this.appSettingsService.config.imgUrl}`;
    }

    public urlUpload: string;
    public imgUrl: string;

    buscarTodosProdutos(): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo`
        );
    }

    buscarDadosImagemPorProduto(produto): Observable<ProdutoCatalogoImagem[]> {
        return this.http.get<ProdutoCatalogoImagem[]>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/imagem/${produto}`
        );
    }

    buscarProdutosAtivos(): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/ativos`
        );
    }

    buscarPorCodigo(codigo): Observable<ProdutoCatalogo[]> {
        return this.http.get<ProdutoCatalogo[]>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/codigo/${codigo}`
        );
    }

    buscarProdutoDetalhe(id: any): Observable<ProdutoCatalogo> {
        return this.http.get<ProdutoCatalogo>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/${id}/detalhes`
        );
    }

    buscarProdutoPropriedades(id: string): Observable<ProdutoCatalogoItem> {
        return this.http.get<ProdutoCatalogoItem>(
            `${this.appSettingsService.config.apiUrl}produto/itens/${id}`
        );
    }

    buscarProdutoPropriedadesOpcoes(
        id: string
    ): Observable<ProdutoCatalogoItem> {
        return this.http.get<ProdutoCatalogoItem>(
            `${this.appSettingsService.config.apiUrl}produto/opcoes/${id}`
        );
    }

    excluirProduto(id: string): Observable<boolean> {
        return this.http.delete<boolean>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/${id}`
        );
    }

    criarProduto(formData: FormData): Observable<CadastroProdutoCatalogoResponse> {
        return this.http.post<CadastroProdutoCatalogoResponse>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/criar`,
            formData
        );
    }

    criarProdutoCatalogoItem(produtoCatalogoItem: any): Observable<any> {
        return this.http.post<any>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/item`,
            produtoCatalogoItem
        );
    }

    atualizarProduto(formData: FormData): Observable<any> {
        return this.http.put<any>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo`,
            formData
        );
    }

    excluirImagem(idProduto: string, idImagem: string): Observable<string> {
        return this.http.delete<string>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/imagem?idProduto=${idProduto}&idImagem=${idImagem}`
        );
    }

    /* Propriedades do Produto */
    buscarPropriedades(): Observable<ProdutoCatalogoPropriedade[]> {
        return this.http.get<ProdutoCatalogoPropriedade[]>(
            `${this.appSettingsService.config.apiUrl}produto/propriedades`
        );
    }

    buscarPropriedadesProdutosAtivos(): Observable<
        ProdutoCatalogoItemProdutosAtivosDados[]
    > {
        return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.appSettingsService.config.apiUrl}produto/listar-produtos-propriedades-ativos`
        );
    }

    buscarPropriedadesProdutoAtivo(obj: ProdutosAtivosRequestViewModel): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {

        return this.http.post<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.appSettingsService.config.apiUrl}produto/buscar-produtos-opcoes-ativos`, obj
        );
    }

    buscarPropriedadesEOpcoesProdutosAtivos(): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.appSettingsService.config.apiUrl}produto/listar-propriedades-opcoes-produtos-ativos`
        );
    }

    /* Propriedades do Produto */
    buscarFabricantes(): Observable<ProdutoCatalogoFabricante[]> {
        return this.http.get<ProdutoCatalogoFabricante[]>(
            `${this.appSettingsService.config.apiUrl}produto/fabricantes`
        );
    }

    buscarOpcoes(): Observable<ProdutoCatalogoPropriedadeOpcao[]> {
        return this.http.get<ProdutoCatalogoPropriedadeOpcao[]>(
            `${this.appSettingsService.config.apiUrl}produto/opcoes`
        );
    }

    buscarPropriedadesPorId(
        id: number
    ): Observable<ProdutoCatalogoPropriedade> {
        return this.http.get<ProdutoCatalogoPropriedade>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/propriedades/${id}`
        );
    }

    criarPropriedades(produto: ProdutoCatalogoPropriedade): Observable<any> {
        return this.http.post<any>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/propriedades`,
            produto
        );
    }

    atualizarPropriedades(produto: ProdutoCatalogoPropriedade): Observable<ProdutoCatalogoPropriedadeOpcaoResponse> {
        return this.http.put<ProdutoCatalogoPropriedadeOpcaoResponse>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/propriedades`,
            produto
        );
    }

    listarProdutosPropriedadesAtivos(
        request: ProdutoCalculadoraVrfRequestViewModel
    ): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
        return this.http.post<ProdutoCatalogoItemProdutosAtivosDados[]>(
            `${this.appSettingsService.config.apiUrl}produtocatalogo/listar-produtos-propriedades`, request
        );
    }

    buscarProdutosAtivosLista(): Observable<any> {
        return this.http.get<any>(
            `${this.appSettingsService.config.apiUrl}produto/listar-produtos-ativos`
        );
    }

    buscarDataTypes(): Observable<Array<DataType>> {
        return this.http.get<Array<DataType>>(`${this.appSettingsService.config.apiUrl}produtocatalogo/buscarDataTypes`);
    }

    buscarTipoPropriedades(): Observable<Array<any>> {
        return this.http.get<Array<any>>(`${this.appSettingsService.config.apiUrl}produtocatalogo/buscarTipoPropriedades`);
    }

    buscarPropriedadesUtilizadas(id: number): Observable<any> {
        return this.http.get<any>(`${this.appSettingsService.config.apiUrl}produtocatalogo/ObterPropriedadesUtilizadosPorProdutos/${id}`);
    }

    excluirPropriedades(id: number, loja: string): Observable<any> {
        return this.http.post<any>(`${this.appSettingsService.config.apiUrl}produtocatalogo/ExcluirPropriedades/${id}`, { idPropriedade: id, loja: loja });
    }

    buscarGruposProdutos():Observable<ProdutosGruposResponse>{
        return this.http.get<ProdutosGruposResponse>(`${this.appSettingsService.config.apiUrl}produto/buscarGruposProdutos`);
    
    }
}