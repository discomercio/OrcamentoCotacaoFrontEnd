import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Usuario } from 'src/app/dto/usuarios/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  buscarTodosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('https://localhost:5001/Usuario');
    //return this.http.get<Usuario[]>('assets/demo/data/banco/usuarios.json');
  }

  buscarVendedores(): Observable<UsuarioXLoja[]> {
    return this.http.get<UsuarioXLoja[]>('assets/demo/data/banco/usuario_x_loja.json');
  }

  buscarParceiros(): Observable<Parceiro[]> {
    return this.http.get<Parceiro[]>('assets/demo/data/banco/parceiro_x_usuario.json');
  }

  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    debugger;
    return this.http.post<Usuario>('https://localhost:5001/Usuario',usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    debugger;
    return this.http.put<Usuario>('https://localhost:5001/Usuario',usuario);
  }
}
