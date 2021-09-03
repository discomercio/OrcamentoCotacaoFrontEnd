import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuarios } from '../dto/usuarios/usuarios';
import { UsuariosService } from '../service/usuarios/usuarios.service';
import { AlertaService } from '../utilities/alert-dialog/alerta.service';
import { MenuItem } from 'primeng/api';
import { AppMenuComponent } from '../app.menu.component';

@Component({
  selector: 'app-usuario-edicao',
  templateUrl: './usuario-edicao.component.html',
  styleUrls: ['./usuario-edicao.component.scss']
})
export class UsuarioEdicaoComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly usuariosService: UsuariosService,
    private readonly alertaService: AlertaService) { }

  public apelido: string;
  public usuario: Usuarios = new Usuarios();
  breadcrumbItems: Array<MenuItem> = new Array<MenuItem>();

  
  ngOnInit(): void {
    this.apelido = this.activatedRoute.snapshot.params.apelido;
    if (!!this.apelido) {
      this.usuario = this.usuariosService.buscarUsuario(this.apelido);
    }
    
  }

  teste(){
    debugger;
  }
}
