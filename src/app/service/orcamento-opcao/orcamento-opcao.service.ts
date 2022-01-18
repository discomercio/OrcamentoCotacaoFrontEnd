import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoOpcaoService {

  constructor(private http: HttpClient) { }

  enviarOrcamentoOpcao(orcamentoOpcao: OrcamentoOpcaoDto): Observable<OrcamentoOpcaoDto> {
    return this.http.post<OrcamentoOpcaoDto>(environment.apiUrl + "OrcamentoOpcao", orcamentoOpcao);
  }

  removerOrcamentoOpcao(): Observable<any> {
    return this.http.delete<OrcamentoOpcaoDto>(environment.apiUrl + "OrcamentoOpcao");
  }

  buscarOpcoesOrcamento(id: string): Observable<OrcamentoOpcaoDto[]> {
    let params = new HttpParams();
    params = params.append("id", id);
    return this.http.get<OrcamentoOpcaoDto[]>("assets/demo/data/banco/lista-opcoes-orcamento.json");
  }
}
