import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { environment } from 'src/environments/environment';
import { ProdutoRequest } from 'src/app/dto/produtos/produtoRequest';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { CoeficienteRequest } from 'src/app/dto/produtos/coeficienteRequest';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(private http: HttpClient) { }

  buscarProdutosCompostosXSimples(produtoRequest: ProdutoRequest): Observable<ProdutoComboDto> {
    return this.http.post<ProdutoComboDto>(environment.apiUrl + "Produto/buscarProdutos", produtoRequest);
  }

  buscarCoeficientes(coeficienteRequest:CoeficienteRequest):Observable<CoeficienteDto[]>{
    return this.http.post<CoeficienteDto[]>(environment.apiUrl + "Produto/buscarCoeficientes", coeficienteRequest);
  }
}
