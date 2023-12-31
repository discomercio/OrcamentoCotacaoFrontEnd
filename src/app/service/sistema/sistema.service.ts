import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {

  constructor(
    private http: HttpClient,
    private appSettingsService: AppSettingsService) { }

    versaoFrontTxt:string;
  retornarVersao():Observable<any> {
    return this.http.get<any>(this.appSettingsService.config.apiUrl + 'Sistema/versao');
  }

  retornarVersaoCache(): Observable<string> {
    let response = this.http.get<string>(this.appSettingsService.config.apiUrl + 'Sistema/cache');
    return response;
  }

}