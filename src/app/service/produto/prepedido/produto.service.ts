import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoComboDto } from 'src/app/dto/prepedido/Produto/ProdutoComboDto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  public listarProdutosCombo(loja: string, idCliente: string): Observable<ProdutoComboDto> {
    let params = new HttpParams();
    params = params.append('loja', loja); //temporario
    params = params.append('id_cliente', idCliente);

    return this.http.get<ProdutoComboDto>(this.appSettingsService.config.apiUrl + 'api/produto/buscarProduto', { params: params });
  }
}