import { environment } from 'src/environments/environment';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutoCatalogoService {

  constructor(private http: HttpClient) { }

  public urlUpload: string = `${environment.apiUrl}v1/produtocatalogo/imagem`;
  public imgUrl: string = `${environment.imgUrl}`;

  buscarTodosProdutos(): Observable<ProdutoCatalogo[]> {
    return this.http.get<ProdutoCatalogo[]>(`${environment.apiUrl}v1/produtocatalogo`);
  }

  buscarProdutoDetalhe(id:string):Observable<ProdutoCatalogo>{
    return this.http.get<ProdutoCatalogo>(`${environment.apiUrl}v1/produtocatalogo/${id}/detalhes`);
  }

  excluirProduto(id:string):Observable<boolean>{
    return this.http.delete<boolean>(`${environment.apiUrl}v1/produtocatalogo/${id}`);
  }

  criarProduto(produto:any):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}v1/produtocatalogo`, produto);
  }

  atualizarProduto(produto:any):Observable<any>{
    return this.http.put<any>(`${environment.apiUrl}v1/produtocatalogo`, produto);
  }

  excluirImagem(idProduto:string, idImagem:string):Observable<boolean>{
    return this.http.delete<boolean>(`${environment.apiUrl}v1/produtocatalogo/imagem?idProduto=${idProduto}&idImagem=${idImagem}`);
  }
  
}
