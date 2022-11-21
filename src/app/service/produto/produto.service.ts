import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';
import { CoeficienteRequest } from 'src/app/dto/produtos/coeficienteRequest';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  buscarProdutosCompostosXSimples(produtoRequest: ProdutoRequest): Observable<ProdutoComboDto> {
    return this.http.post<ProdutoComboDto>(this.appSettingsService.config.apiUrl  + "Produto/buscarProdutos", produtoRequest);
  }

  buscarCoeficientes(coeficienteRequest:CoeficienteRequest):Observable<CoeficienteDto[]>{
    return this.http.post<CoeficienteDto[]>(this.appSettingsService.config.apiUrl  + "Produto/buscarCoeficientes", coeficienteRequest);
  }

  
}
