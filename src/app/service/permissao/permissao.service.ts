import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissaoOrcamentoResponse } from './../../dto/permissao/PermissaoOrcamentoResponse';
import { PermissaoPrePedidoResponse } from './../../dto/permissao/PermissaoPrePedidoResponse';
import { PermissaoPedidoResponse } from './../../dto/permissao/PermissaoPedidoResponse';
import { PermissaoIncluirPrePedidoResponse } from 'src/app/dto/permissao/PermissaoIncluirPrePedidoResponse';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService {

    constructor(
      private http: HttpClient, 
      private appSettingsService: AppSettingsService) { }

    buscarPermissaoOrcamento(idOrcamento: number): Observable<PermissaoOrcamentoResponse> {
      return this.http.get<PermissaoOrcamentoResponse>(`${this.appSettingsService.config.apiUrl}Permissao/RetornarPermissaoOrcamento?idOrcamento=${idOrcamento}`);
    };

    buscarPermissaoPrePedido(idPrePedido: string): Observable<PermissaoPrePedidoResponse> {
      return this.http.get<PermissaoPrePedidoResponse>(`${this.appSettingsService.config.apiUrl}Permissao/RetornarPermissaoPrePedido?idPrePedido=${idPrePedido}`);
    };

    buscarPermissaoPedido(idPedido: string): Observable<PermissaoPedidoResponse> {
      return this.http.get<PermissaoPedidoResponse>(`${this.appSettingsService.config.apiUrl}Permissao/RetornarPermissaoPedido?idPedido=${idPedido}`);
    };

    buscarPermissaoIncluirPrePedido(): Observable<PermissaoIncluirPrePedidoResponse> {
      return this.http.get<PermissaoIncluirPrePedidoResponse>(`${this.appSettingsService.config.apiUrl}Permissao/RetornarPermissaoIncluirPrePedido`);
    };
}