import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParceiroService {

  constructor(private http: HttpClient) { }

  // buscarParceiros(vendedorId:any): Observable<any> {
  //   return this.http.get<any>(`${environment.apiUrl}Parceiro?vendedorId=${vendedorId}`);
  // }
  buscarParceiros(loja:any): Observable<any> {
    console.log(`${environment.apiUrl}Parceiro?loja=${loja}`);
    return this.http.get<any>(`${environment.apiUrl}Parceiro?loja=${loja}`);
  }
  // buscarParceiros(vendedorId:any, loja:any): Observable<any> {
  //   return this.http.get<any>(`${environment.apiUrl}Parceiro?vendedorId=${vendedorId}&loja=${loja}`);
  // }

  buscarVendedoresParceiros(idParceiro:any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Parceiro/vendedores-parceiros?idParceiro=${idParceiro}`);
  }
}
