import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(private http: HttpClient) { }

  buscarProdutosCompostosXSimples(loja: string, uf: string, tipo: string): Observable<ProdutoComboDto> {
    let params = new HttpParams();
    params = params.append("loja", loja);
    params = params.append("uf", uf);
    params = params.append("tipo", tipo);
    return this.http.get<ProdutoComboDto>(environment.apiUrl + "Produto/buscarProduto", { params: params });
  }
}
