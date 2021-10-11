import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaProdutoDto } from 'src/app/dto/produtos/ListaProdutoDto';
import { DetalhesProdutoDto } from 'src/app/dto/produtos/DetalhesProdutoDto';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(private http: HttpClient) { }

  buscarTodosProdutos(): Observable<ListaProdutoDto[]> {
    return this.http.get<ListaProdutoDto[]>("assets/demo/data/banco/lista-produtos.json");
  }

  buscarProduto(produto:string):Observable<DetalhesProdutoDto[]>{
    return this.http.get<DetalhesProdutoDto[]>("assets/demo/data/banco/produtos.json");
  }

  buscarProdutosCompostosXSimples():Observable<ProdutoComboDto>{
    return this.http.get<ProdutoComboDto>("assets/demo/data/banco/produtos_compostos_x_filhos.json");
  }
}
