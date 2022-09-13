import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';


@Injectable({
  providedIn: 'root'
})
export class OrcamentoOpcaoService {

  constructor(private http: HttpClient, private env: environment) { }
  enviarOrcamentoOpcao(orcamentoOpcao: OrcamentosOpcaoResponse): Observable<OrcamentosOpcaoResponse> {
    return this.http.post<OrcamentosOpcaoResponse>(this.env.apiUrl() + "OrcamentoOpcao", orcamentoOpcao);
  }

  removerOrcamentoOpcao(): Observable<any> {
    return this.http.delete<OrcamentosOpcaoResponse>(this.env.apiUrl() + "OrcamentoOpcao");
  }

  buscarOpcoesOrcamento(id: string): Observable<OrcamentosOpcaoResponse[]> {
    let params = new HttpParams();
    params = params.append("id", id);
    return this.http.get<OrcamentosOpcaoResponse[]>("assets/demo/data/banco/lista-opcoes-orcamento.json");
  }
}
