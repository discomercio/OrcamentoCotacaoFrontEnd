import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrcamentistaIndicadorVendedorService {

  constructor(private http: HttpClient) { }

  buscarVendedoresParceiros(parceiro:string): Observable<OrcamentistaIndicadorVendedorDto[]> {
    let params = new HttpParams();
    params = params.append('parceiro', parceiro);

    return this.http.get<OrcamentistaIndicadorVendedorDto[]>(environment.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', { params: params });
  }
}
