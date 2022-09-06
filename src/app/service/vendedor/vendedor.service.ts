import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  constructor(private http: HttpClient) { }

  buscarVendedores(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Vendedor`);
  }
}