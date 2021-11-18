import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoOpcaoService {

  constructor(private http: HttpClient) { }

  enviarOrcamentoOpcao(orcamentoOpcao:OrcamentoOpcaoDto){
    return this.http.post<any[]>(environment.apiUrl + "OrcamentoOpcao", orcamentoOpcao);
  }
}
