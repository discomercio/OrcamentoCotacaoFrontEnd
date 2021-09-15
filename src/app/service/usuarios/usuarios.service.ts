import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  buscarTodosUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>('assets/demo/data/banco/usuarios.json');
  }

  buscarUsuario(apelido: string) {
    let usuario: Usuarios;

    this.buscarTodosUsuarios().toPromise().then((r) => {
      if (!!r) {
        debugger;
        let usuarios: Usuarios[] = r;
        usuario = usuarios.filter(usuario => usuario.apelido == apelido)[0];
      }
    });
      return usuario;
    // return this.http.get<Usuarios>(JSON.stringify(usuario));
  }
}
