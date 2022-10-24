import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { environment } from 'src/environments/environment';
import { stream } from 'xlsx';
import { Operacao } from 'src/app/dto/operacao/operacao';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private http: HttpClient,
    private env: environment
    ) { 

  }


  buscarTodosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.env.apiUrl() + 'Usuario');
  }

  buscarVendedores(loja: string): Observable<Usuario[]> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    return this.http.get<Usuario[]>(this.env.apiUrl() + 'Usuario/vendedores', { params: params });
  }

  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.env.apiUrl() + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.env.apiUrl() + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }

  buscarOperacaoUsuarioPorModuloCotac(): Observable<Operacao[]> {
    let params = new HttpParams();
    params = params.append('modulo', 'COTAC');
    return this.http.get<Operacao[]>(this.env.apiUrl() + 'Operacao/modulo', { params: params });
  }

}
