import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaProdutoDto } from 'src/app/dto/produtos/ListaProdutoDto';
import { DetalhesProdutoDto } from 'src/app/dto/produtos/DetalhesProdutoDto';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(private http: HttpClient) { }

  buscarTodosProdutos(): Observable<ListaProdutoDto[]> {
    return this.http.get<ListaProdutoDto[]>("assets/demo/data/banco/lista-produtos.json");
  }

  buscarProduto(produto: string): Observable<DetalhesProdutoDto[]> {
    return this.http.get<DetalhesProdutoDto[]>("assets/demo/data/banco/produtos.json");
  }

  buscarProdutosCompostosXSimples(page: string, pageItens: string, idCliente): Observable<ProdutoComboDto> {
    let params = new HttpParams();
    params = params.append("page", page);
    params = params.append("pageItens", pageItens);
    params = params.append("idCliente", idCliente);
    return this.http.get<ProdutoComboDto>(environment.apiUrl + "Produto", { params: params });
  }
}
