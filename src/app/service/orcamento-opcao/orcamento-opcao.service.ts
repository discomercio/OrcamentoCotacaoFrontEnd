import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoOpcaoService {

  constructor(private http: HttpClient) { }

  enviarOrcamentoOpcao(orcamentoOpcao:OrcamentoOpcaoDto):Observable<OrcamentoOpcaoDto>{
    return this.http.post<OrcamentoOpcaoDto>(environment.apiUrl + "OrcamentoOpcao", orcamentoOpcao);
  }
}
