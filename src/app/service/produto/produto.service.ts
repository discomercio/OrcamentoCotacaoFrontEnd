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

  buscarProdutosCompostosXSimples(page: string, pageItens: string, idCliente): Observable<ProdutoComboDto> {
    let params = new HttpParams();
    params = params.append("page", page);
    params = params.append("pageItens", pageItens);
    params = params.append("idCliente", idCliente);
    return this.http.get<ProdutoComboDto>(environment.apiUrl + "Produto", { params: params });
  }
}
