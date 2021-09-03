import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidacaoFormularioComponent } from '../utilities/validacao-formulario/validacao-formulario.component';
import { SelectItem } from 'primeng/api/selectitem';
import { UsuariosService } from '../service/usuarios/usuarios.service';
import { Usuarios } from '../dto/usuarios/usuarios';
import { AlertaService } from '../utilities/alert-dialog/alerta.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

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
      this.router.navigate(['usuario-edicao/', this.usuarioSelecionado.apelido]);
     }
  }
}
