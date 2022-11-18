import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoRemoverService {

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  public remover(numeroPrePedido: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.appSettingsService.config.apiUrl}api/Prepedido/removerPrePedido/`+ numeroPrePedido, numeroPrePedido);
  }
}