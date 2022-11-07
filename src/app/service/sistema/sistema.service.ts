import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SistemaResponse } from './sistemaResponse';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {

    constructor(
      private http: HttpClient, 
      private appSettingsService: AppSettingsService) { }
      
      retornarVersao(): Observable<SistemaResponse> {        
        let response = this.http.get<SistemaResponse>(this.appSettingsService.config.apiUrl + 'Sistema/versao');
        return response;
      } 
       
      retornarVersaoCache(): Observable<SistemaResponse> {        
        let response = this.http.get<SistemaResponse>(this.appSettingsService.config.apiUrl + 'Sistema/cache');
        return response;
      }       

}