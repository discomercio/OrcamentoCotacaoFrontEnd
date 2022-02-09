import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
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

  /*  buscarParceiros(): Observable<Parceiro[]> {
     return this.http.get<Parceiro[]>('assets/demo/data/banco/parceiro_x_usuario.json');
   } */



  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(environment.apiUrl + 'Usuario', usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(environment.apiUrl + 'Usuario', usuario);
  }
}
