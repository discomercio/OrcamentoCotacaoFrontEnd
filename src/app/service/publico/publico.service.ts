import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  constructor(private http: HttpClient,
    private env : environment) {}

  buscarOrcamentoPorGuid(guid: string) {
    return this.http.get<OrcamentoCotacaoDto>(`${this.env.apiUrl() }publico/orcamentoporguid/${guid}`);
  }
}
