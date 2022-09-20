import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PermissaoOrcamentoResponse } from './../../dto/permissao/PermissaoOrcamentoResponse';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService {

    constructor(private http: HttpClient, private env: environment) { }

    buscarPermissaoOrcamento(idOrcamento: number,): Observable<PermissaoOrcamentoResponse> {
        return this.http.get<PermissaoOrcamentoResponse>(`${this.env.apiUrl()}Permissao/RetornarPermissaoOrcamento?idOrcamento=${idOrcamento}`);
      }
}