import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParceirosService {

  constructor(private http: HttpClient) { }

  buscarParceiros(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Parceiro`);
  }

  buscarVendedoresParceiros(idParceiro:any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Parceiro?idParceiro=${idParceiro}`);
  }
}
