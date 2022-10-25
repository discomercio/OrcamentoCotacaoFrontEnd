import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SistemaResponse } from './sistemaResponse';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {

    constructor(private http: HttpClient, private env: environment) { }

      versaoApi(): Observable<SistemaResponse> {        
        let response = this.http.get<SistemaResponse>(this.env.apiUrl() + 'Sistema/versao');
        return response;
      }      
}