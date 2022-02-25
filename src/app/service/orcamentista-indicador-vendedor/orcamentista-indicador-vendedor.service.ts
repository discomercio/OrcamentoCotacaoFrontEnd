import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/dto/usuarios/usuario';

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
  buscarVendedoresParceirosPorId(id:string): Observable<Usuario> {
    return this.http.get<Usuario>(environment.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros/'+id);
  }
  cadastrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(environment.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }
  atualizar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(environment.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }
}
