import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { BuscarParceiroRequest } from 'src/app/dto/orcamentista-indicador/buscar-parceiro-request';
import { OrcamentistasComboResponse } from 'src/app/dto/orcamentista-indicador/orcamentistas-combo-response';

@Injectable({
  providedIn: 'root'
})
export class OrcamentistaIndicadorService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  buscarParceirosPorLoja(loja:string): Observable<OrcamentistaIndicadorDto[]> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    return this.http.get<OrcamentistaIndicadorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEindicador/BuscarParceirosPorLoja', { params: params });
  }

  buscarParceirosPorVendedor(vendedor:string, loja: string): Observable<OrcamentistaIndicadorDto[]> {
    let params = new HttpParams();
    params = params.append('vendedorId', vendedor);
    params = params.append('loja', loja);
    return this.http.get<OrcamentistaIndicadorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEindicador/BuscarParceiros', { params: params });
  }

  buscarParceiroPorApelido(apelido:string):Observable<OrcamentistaIndicadorDto>{
    let params = new HttpParams();
    params = params.append('apelido', apelido);
      return this.http.get<OrcamentistaIndicadorDto>(`${this.appSettingsService.config.apiUrl}OrcamentistaEindicador/parceiro-por-apelido`, {params:params});
  }

  buscarParceirosPorIdVendedor(filtro:BuscarParceiroRequest):Observable<OrcamentistasComboResponse>{
    return this.http.post<OrcamentistasComboResponse>(`${this.appSettingsService.config.apiUrl}OrcamentistaEindicador/buscarParceirosPorIdVendedor`, filtro);
  }

  buscarParceirosHabilitados(){
    return this.http.get<OrcamentistaIndicadorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEindicador/buscarParceirosHabilitados');
  }
}

