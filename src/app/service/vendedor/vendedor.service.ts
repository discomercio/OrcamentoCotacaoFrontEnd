import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  constructor(
    private http: HttpClient,
    private appSettingsService: AppSettingsService) { }

  buscarVendedores(): Observable<any> {
    return this.http.get<any>(`${this.appSettingsService.config.apiUrl}Vendedor`);
  }
}