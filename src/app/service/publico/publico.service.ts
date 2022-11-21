import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  constructor(
    private http: HttpClient,
    private appSettingsService: AppSettingsService) {}

  buscarOrcamentoPorGuid(guid: string) {
    return this.http.get<OrcamentoCotacaoDto>(`${this.appSettingsService.config.apiUrl }publico/orcamentoporguid/${guid}`);
  }
}
