import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})

export class DashboardOrcamentoService {

  constructor(private readonly http: HttpClient, private env: environment, private appSettingsService: AppSettingsService) { }

  public dashboardOrcamentoParceiro(): Observable<any> {
    return this.http.get<any>(`${this.appSettingsService.config.apiUrl}dashboard/orcamento/parceiro`);
  }
  
  public dashboardOrcamentoVendedorInterno(loja): Observable<any> {

    let params = new HttpParams();    
    params = params.append("IdOrcamentoCotacao", loja);
    //return this.http.get<MensageriaDto[]>(this.appSettingsService.config.apiUrl + "Mensagem/pendente?IdOrcamentoCotacao=" + idOrcamentoCotacao);

    return this.http.get<any>(this.appSettingsService.config.apiUrl + "dashboard/orcamento/vendedor-interno?loja="+ loja);
  }  

}

