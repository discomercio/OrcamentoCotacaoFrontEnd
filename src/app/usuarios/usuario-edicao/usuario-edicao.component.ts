import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';

@Component({
  selector: 'app-usuario-edicao',
  templateUrl: './usuario-edicao.component.html',
  styleUrls: ['./usuario-edicao.component.scss']
})
export class UsuarioEdicaoComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly usuariosService: UsuariosService,
    private readonly alertaService: AlertaService,
    private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent) { }

  public form: FormGroup;
  public apelido: string;
  usuario = new Usuarios();
  public mensagemErro: string = "*Campo obrigatório.";

  ngOnInit(): void {
    this.criarForm();
    this.apelido = this.activatedRoute.snapshot.params.apelido;
    if (!!this.apelido) {
      this.usuariosService.buscarTodosUsuarios().toPromise().then((r) => {
        if (!!r) {
          let usuarios: Usuarios[] = r;
          this.usuario = usuarios.filter(usuario => usuario.apelido == this.apelido)[0];
          this.criarForm();
        }
      });
    }
    this.selectPerfil();
    this.selectTipo();
  }

  lstPerfil: SelectItem[];
  selectPerfil() {
    this.lstPerfil = [
      { label: "Administrador", value: { id: 1, name: "Administrador" } },
      { label: "Gestor", value: { id: 2, name: "Gestor" } },
      { label: "Vendedor", value: { id: 3, name: "Vendedor" } },
      { label: "Parceiro", value: { id: 4, name: "Parceiro" } },
      { label: "Vendedor Parceiro", value: { id: 5, name: "Vendedor Parceiro" } },
    ];
  }

  lstTipo: SelectItem[];
  selectTipo() {
    this.lstTipo = [
      { label: "PF", value: { id: 1, name: "PF" } },
      { label: "PJ", value: { id: 2, name: "PJ" } }
    ]
  }

  criarForm() {
    this.form = this.fb.group({
      nome: [this.usuario.nome],
      apelido: [this.usuario.apelido],
      email: [this.usuario.email],
      perfil: [this.usuario.perfil],
      senha: [this.usuario.senha],
      confirmacao: [this.usuario.senha],
      tipo: [this.usuario.tipo],
      cpf_cnpj: [this.usuario.cpf_cnpj],
      rg_ie: [this.usuario.rg],
      ddd1_telefone1: [this.usuario.telefone1],
      ddd2_telefone2: [this.usuario.telefone2],
      ddd3_telefone3: [this.usuario.telefone3],
      ativo: [this.usuario.ativo]
    })
  }
  teste() {
    debugger;
  }
}
