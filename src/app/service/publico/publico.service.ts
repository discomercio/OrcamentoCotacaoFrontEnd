import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  constructor(private http: HttpClient,
    private envir : environment) {}

  buscarOrcamentoPorGuid(guid: string) {
    return this.http.get<OrcamentoCotacaoDto>(`${this.envir.apiUrl()}publico/orcamentoporguid/${guid}`);
  }

}
