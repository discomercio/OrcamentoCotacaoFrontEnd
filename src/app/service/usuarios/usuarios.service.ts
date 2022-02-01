import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { environment } from 'src/environments/environment';
import { stream } from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  
  buscarTodosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(environment.apiUrl + 'Usuario');
  }

  buscarVendedores(loja: string): Observable<Usuario[]> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    return this.http.get<Usuario[]>(environment.apiUrl + 'Usuario/vendedores', { params: params });
  }

  buscarParceiros(): Observable<Parceiro[]> {
    return this.http.get<Parceiro[]>(environment.apiUrl + 'Usuario/parceiros');
  }

  buscarParceirosPorVendedor(vendedor: string): Observable<Parceiro[]> {
    let params = new HttpParams();
    params = params.append('vendedorId', vendedor);
    return this.http.get<Parceiro[]>(environment.apiUrl + 'OrcamentistaEindicador/BuscarParceiros', { params: params });
  }

  buscarVendedoresParceiros(parceiro: string): Observable<Parceiro[]> {
    let params = new HttpParams();
    params = params.append('parceiro', parceiro);

    return this.http.get<Parceiro[]>(environment.apiUrl + 'Usuario/vendedores-parceiros', { params: params });
  }

  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(environment.apiUrl + 'Usuario', usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(environment.apiUrl + 'Usuario', usuario);
  }
}
