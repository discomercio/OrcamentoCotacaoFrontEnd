import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { SelectItem } from 'primeng/api/selectitem';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styleUrls: ['./usuario-lista.component.scss']
})
export class UsuarioListaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly usuariosService: UsuariosService,
    private readonly alertaService: AlertaService,
    private readonly router: Router) { }

  @ViewChild('dataTable') table: Table;
  usuarios: Usuarios[] = new Array<Usuarios>();
  usuarioSelecionado: Usuarios;
  public form: FormGroup;
  cols: any[];
  perfil: SelectItem;
  carregando: boolean = false;

  ngOnInit(): void {
    this.usuariosService.buscarTodosUsuarios().toPromise().then((r) => {
      if (r == null) {
        debugger;
        this.alertaService.mostrarErroInternet(r);
        return;
      }
      this.usuarios = r;
    }).catch((r) => this.alertaService.mostrarErroInternet(r));

    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      apelido: ['', [Validators.required]],
      perfil: ['', [Validators.required]]
    });
    this.cols = [
      { field: 'responsavel', header: 'Responsável' },
      { field: 'papel', header: 'Papel' },
      { field: 'nome', header: 'Nome' },
      { field: 'apelido', header: 'Apelido' },
      { field: 'ativo', header: 'Ativo' }
    ];
  }

  editarUsuario() {
    if (!!this.usuarioSelecionado) {
      this.router.navigate(['/usuarios/usuario-edicao', this.usuarioSelecionado.apelido]);
    }
  }
}
