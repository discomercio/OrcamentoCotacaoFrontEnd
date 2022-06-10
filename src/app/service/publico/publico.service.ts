import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  constructor(private http: HttpClient) {}

  buscarOrcamentoPorGuid(guid: string) {
    return this.http.get<OrcamentoCotacaoDto>(`${environment.apiUrl}publico/orcamentoporguid/${guid}`);
  }

}
