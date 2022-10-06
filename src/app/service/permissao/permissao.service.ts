import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PermissaoOrcamentoResponse } from './../../dto/permissao/PermissaoOrcamentoResponse';
import { PermissaoPrePedidoResponse } from './../../dto/permissao/PermissaoPrePedidoResponse';
import { PermissaoPedidoResponse } from './../../dto/permissao/PermissaoPedidoResponse';
import { PermissaoIncluirPrePedidoResponse } from 'src/app/dto/permissao/PermissaoIncluirPrePedidoResponse';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService {

    constructor(private http: HttpClient, private env: environment) { }

    buscarPermissaoOrcamento(idOrcamento: number): Observable<PermissaoOrcamentoResponse> {
        return this.http.get<PermissaoOrcamentoResponse>(`${this.env.apiUrl()}Permissao/RetornarPermissaoOrcamento?idOrcamento=${idOrcamento}`);
      };

      buscarPermissaoPrePedido(idPrePedido: string): Observable<PermissaoPrePedidoResponse> {
        return this.http.get<PermissaoPrePedidoResponse>(`${this.env.apiUrl()}Permissao/RetornarPermissaoPrePedido?idPrePedido=${idPrePedido}`);
      };

      buscarPermissaoPedido(idPedido: string): Observable<PermissaoPedidoResponse> {
        return this.http.get<PermissaoPedidoResponse>(`${this.env.apiUrl()}Permissao/RetornarPermissaoPedido?idPedido=${idPedido}`);
      };

      buscarPermissaoIncluirPrePedido(): Observable<PermissaoIncluirPrePedidoResponse> {
        return this.http.get<PermissaoIncluirPrePedidoResponse>(`${this.env.apiUrl()}Permissao/RetornarPermissaoIncluirPrePedido`);
      };
}