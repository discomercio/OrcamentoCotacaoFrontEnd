import { environment } from 'src/environments/environment';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoItem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoItem';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';

@Injectable({
  providedIn: 'root'
})
export class ProdutoCatalogoService {

  constructor(private http: HttpClient) { }

  public urlUpload: string = `${environment.apiUrl}produtocatalogo/imagem`;
  public imgUrl: string = `${environment.imgUrl}`;

  buscarTodosProdutos(): Observable<ProdutoCatalogo[]> {
    return this.http.get<ProdutoCatalogo[]>(`${environment.apiUrl}produtocatalogo`);
  }

  buscarProdutosAtivos(): Observable<ProdutoCatalogo[]> {
    return this.http.get<ProdutoCatalogo[]>(`${environment.apiUrl}produtocatalogo/ativos`);
  }

  buscarPorCodigo(codigo): Observable<ProdutoCatalogo[]> {
    return this.http.get<ProdutoCatalogo[]>(`${environment.apiUrl}produtocatalogo/codigo/${codigo}`);
  }

  buscarProdutoDetalhe(id: any): Observable<ProdutoCatalogo> {
    return this.http.get<ProdutoCatalogo>(`${environment.apiUrl}produtocatalogo/${id}/detalhes`);
  }

  buscarProdutoPropriedades(id: string): Observable<ProdutoCatalogoItem> {
    return this.http.get<ProdutoCatalogoItem>(`${environment.apiUrl}produto/itens/${id}`);
  }

  buscarProdutoPropriedadesOpcoes(id: string): Observable<ProdutoCatalogoItem> {
    return this.http.get<ProdutoCatalogoItem>(`${environment.apiUrl}produto/opcoes/${id}`);
  }

  excluirProduto(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}produtocatalogo/${id}`);
  }

  criarProduto(produto:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}produtocatalogo`, produto);
  }

  criarProdutoCatalogoItem(produtoCatalogoItem:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}produtocatalogo/item`, produtoCatalogoItem);
  }

  atualizarProduto(produto: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}produtocatalogo`, produto);
  }

  excluirImagem(idProduto: string, idImagem: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}produtocatalogo/imagem?idProduto=${idProduto}&idImagem=${idImagem}`);
  }

  /* Propriedades do Produto */
  buscarPropriedades(): Observable<ProdutoCatalogoPropriedade[]> {
    return this.http.get<ProdutoCatalogoPropriedade[]>(`${environment.apiUrl}produto/propriedades`);
  }

  buscarPropriedadesProdutosAtivos(): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
    return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(`${environment.apiUrl}produto/listar-produtos-propriedades-ativos`);
  }

  buscarPropriedadesProdutoAtivo(idProduto: number, propriedadeOculta: boolean, propriedadeOcultaItem: boolean): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
    return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(`${environment.apiUrl}produto/buscar-produtos-opcoes-ativos/${idProduto}&${propriedadeOculta}&${propriedadeOcultaItem}`);
  }

    buscarPropriedadesEOpcoesProdutosAtivos():Observable<any[]>{

      return this.http.get<any[]>(`${environment.apiUrl}produto/listar-propriedades-opcoes-produtos-ativos`);
    }

    /* Propriedades do Produto */
    buscarFabricantes(): Observable<ProdutoCatalogoFabricante[]> {
      return this.http.get<ProdutoCatalogoFabricante[]>(`${environment.apiUrl}produto/fabricantes`);
    }

    buscarOpcoes(): Observable<ProdutoCatalogoPropriedadeOpcao[]> {
    return this.http.get<ProdutoCatalogoPropriedadeOpcao[]>(`${environment.apiUrl}produto/opcoes`);
   }

  buscarPropriedadesPorId(id: string): Observable<ProdutoCatalogoPropriedade> {
    return this.http.get<ProdutoCatalogoPropriedade>(`${environment.apiUrl}produto/propriedades/${id}`);
  }

  criarPropriedades(produto: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}produto/propriedades`, produto);
  }

  atualizarPropriedades(produto: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}produto/propriedades`, produto);
  }

  listarProdutosPropriedadesAtivos(propriedadeOculta: boolean, propriedadeOcultaItem: boolean): Observable<ProdutoCatalogoItemProdutosAtivosDados[]> {
    return this.http.get<ProdutoCatalogoItemProdutosAtivosDados[]>(`${environment.apiUrl}produtocatalogo/listar-produtos-propriedades/${propriedadeOculta}&${propriedadeOcultaItem}`);
  }

  buscarProdutosAtivosLista(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}produto/listar-produtos-ativos`);
  }
}
