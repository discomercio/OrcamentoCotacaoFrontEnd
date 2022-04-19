import { environment } from 'src/environments/environment';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  buscarProdutoDetalhe(id:string):Observable<ProdutoCatalogo>{
    return this.http.get<ProdutoCatalogo>(`${environment.apiUrl}produtocatalogo/${id}/detalhes`);
  }

  excluirProduto(id:string):Observable<boolean>{
    return this.http.delete<boolean>(`${environment.apiUrl}produtocatalogo/${id}`);
  }

  criarProduto(produto:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}produtocatalogo`, produto);
  }

  atualizarProduto(produto:any):Observable<any>{
    return this.http.put<any>(`${environment.apiUrl}produtocatalogo`, produto);
  }

  excluirImagem(idProduto:string, idImagem:string):Observable<boolean>{
    return this.http.delete<boolean>(`${environment.apiUrl}produtocatalogo/imagem?idProduto=${idProduto}&idImagem=${idImagem}`);
    }

    /* Propriedades do Produto */
    buscarPropriedades(): Observable<ProdutoCatalogoPropriedade[]> {
        return this.http.get<ProdutoCatalogoPropriedade[]>(`${environment.apiUrl}produto/propriedades`);
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
  
}
