import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { environment } from 'src/environments/environment';
import { stream } from 'xlsx';
import { Operacao } from 'src/app/dto/operacao/operacao';
import { AppComponent } from 'src/app/main/app.component';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private http: HttpClient,
    private env: environment,
    private appComponent: AppComponent
    ) { 

  }


  buscarTodosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.appComponent._apiURL + 'Usuario');
  }

  buscarVendedores(loja: string): Observable<Usuario[]> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    return this.http.get<Usuario[]>(this.appComponent._apiURL + 'Usuario/vendedores', { params: params });
  }

  cadastrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.appComponent._apiURL + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }

  alterarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.appComponent._apiURL + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }

  buscarOperacaoUsuarioPorModuloCotac(): Observable<Operacao[]> {
    let params = new HttpParams();
    params = params.append('modulo', 'COTAC');
    return this.http.get<Operacao[]>(this.appComponent._apiURL + 'Operacao/modulo', { params: params });
  } 

}
