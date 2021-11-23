import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  buscarTodosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(environment.apiUrl + 'Usuario');
    //return this.http.get<Usuario[]>('assets/demo/data/banco/usuarios.json');
  }
/* 
  buscarVendedores(): Observable<UsuarioXLoja[]> {
    return this.http.get<UsuarioXLoja[]>('assets/demo/data/banco/usuario_x_loja.json');
  } */

  buscarVendedores(): Observable<UsuarioXLoja[]> {
    return this.http.get<UsuarioXLoja[]>(environment.apiUrl + 'Usuario/vendedores');
  }

 /*  buscarParceiros(): Observable<Parceiro[]> {
    return this.http.get<Parceiro[]>('assets/demo/data/banco/parceiro_x_usuario.json');
  } */

  buscarParceiros(): Observable<Parceiro[]> {
    return this.http.get<Parceiro[]>(environment.apiUrl + 'Usuario/parceiros');
  }

  buscarVendedoresParceiros(): Observable<Parceiro[]> {
    return this.http.get<Parceiro[]>(environment.apiUrl + 'Usuario/vendedores-parceiros');
  }

  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    ;
    return this.http.post<Usuario>(environment.apiUrl + 'Usuario',usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    ;
    return this.http.put<Usuario>(environment.apiUrl + 'Usuario',usuario);
  }
}
