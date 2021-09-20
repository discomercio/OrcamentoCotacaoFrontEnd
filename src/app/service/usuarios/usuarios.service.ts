import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { HttpClient } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  buscarTodosUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>('assets/demo/data/banco/usuarios.json');
  }

  buscarVendedores():Observable<UsuarioXLoja[]>{
    return this.http.get<UsuarioXLoja[]>('assets/demo/data/banco/usuario_x_loja.json');
  }

  buscarParceiros():Observable<Parceiro[]>{
    return this.http.get<Parceiro[]>('assets/demo/data/banco/parceiro_x_usuario.json');
  }
}
