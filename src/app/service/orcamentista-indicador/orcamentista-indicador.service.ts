import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrcamentistaIndicadorService {

  constructor(private http: HttpClient) { }

  buscarParceiros(): Promise<OrcamentistaIndicadorDto[]> {
    return this.http.get<OrcamentistaIndicadorDto[]>(environment.apiUrl + 'Usuario/parceiros').toPromise();
  }

  buscarParceirosPorVendedor(vendedor:string, loja: string): Observable<OrcamentistaIndicadorDto[]> {
    let params = new HttpParams();
    params = params.append('vendedorId', vendedor);
    params = params.append('loja', loja);
    return this.http.get<OrcamentistaIndicadorDto[]>(environment.apiUrl + 'OrcamentistaEindicador/BuscarParceiros', { params: params });
  }
}
