import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoComboDto } from 'src/app/dto/prepedido/Produto/ProdutoComboDto';


@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public listarProdutosCombo(loja: string, idCliente: string): Observable<ProdutoComboDto> {
    let params = new HttpParams();
    params = params.append('loja', loja); //temporario
    params = params.append('id_cliente', idCliente);

    return this.http.get<ProdutoComboDto>(this.env.apiUrl() + 'api/produto/buscarProduto', { params: params });

  }


}
