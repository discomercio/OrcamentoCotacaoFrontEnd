import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoComboCpfcnpjService {

  constructor(
    private readonly http: HttpClient,
    private appSettingsService: AppSettingsService) { }

  public obter(): Observable<string[]> {
    return this.http.get<string[]>(this.appSettingsService.config.apiUrl + 'prepedido/listarCpfCnpjPrepedidosCombo');
  }

}
