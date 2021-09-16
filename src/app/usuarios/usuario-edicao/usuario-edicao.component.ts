import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Usuarios } from 'src/app/dto/usuarios/usuarios';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { CriptoService } from 'src/app/utilities/cripto/cripto.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { LojasService } from 'src/app/service/lojas/lojas.service';

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
    private readonly validacaoFormGroup: ValidacaoFormularioComponent,
    private readonly criptoService: CriptoService,
    private readonly lojasService: LojasService) { }

  public form: FormGroup;
  public apelido: string;
  public usuario = new Usuarios();
  public mensagemErro: string = "*Campo obrigatório.";
  public novoUsuario: boolean = false;
  disabled: boolean = true;
  public formataTelefone = FormataTelefone;
  public lojas = new Array<Lojas>();
  public lojasSelecionadas = new Array<Lojas>();
  public mascaraTelefone: string;

  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.apelido = this.activatedRoute.snapshot.params.apelido;

    this.lojasService.buscarTodasLojas().toPromise().then((r) => {
      if (!!r) {
        this.lojas = r;
      }
    });

    if (this.apelido == "novo") {
      this.novoUsuario = true;
      // this.disabled = false;
    }

    if (this.apelido.toLowerCase() != "")
      if (!!this.apelido) {
        if (this.apelido.toLowerCase() != "novo") {
          this.usuariosService.buscarTodosUsuarios().toPromise().then((r) => {
            if (!!r) {
              let usuarios: Usuarios[] = r;
              this.usuario = usuarios.filter(usuario => usuario.apelido == this.apelido)[0];
              this.criarForm();

              let perfilUsuario = this.lstPerfil.find(p => p.label == this.usuario.perfil);
              if (perfilUsuario.label != "Parceiro" && perfilUsuario.label != "Vendedor Parceiro") {
                this.disabled = false;
              }
              this.form.controls.perfil.setValue(perfilUsuario);

              let tipoUsuario = this.lstTipo.find(t => t.label == this.usuario.tipo);
              this.form.controls.tipo.setValue(tipoUsuario);

              const datastamp = this.usuario.senha;
              const senhaConvertida = this.criptoService.decodificaDado(datastamp, 1209);
              this.form.controls.senha.setValue(senhaConvertida);
              this.form.controls.confirmacao.setValue(senhaConvertida);
            }
          });
        }
      }
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
      nome: [this.usuario.nome, [Validators.required, Validators.maxLength(40)]],
      apelido: [this.usuario.apelido, [Validators.required, Validators.maxLength(20)]],
      email: [this.usuario.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      perfil: ['', [Validators.required]],
      senha: [this.usuario.senha, [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      confirmacao: [this.usuario.senha, [Validators.required, Validators.minLength(5)]],
      tipo: [this.usuario.tipo],
      cpf_cnpj: [this.usuario.cpf_cnpj],
      rg_ie: [this.usuario.ie_rg],
      ddd1_telefone1: [this.usuario.ddd1 + this.usuario.telefone1, [Validators.minLength(10), Validators.maxLength(11)]],
      ddd2_telefone2: [this.usuario.ddd2 + this.usuario.telefone2, [Validators.minLength(10), Validators.maxLength(11)]],
      ddd3_telefone3: [this.usuario.ddd3 + this.usuario.telefone3, [Validators.minLength(10), Validators.maxLength(11)]],
      ativo: [this.usuario.ativo, Validators.required],
      lojasSelecionadas: ['', [Validators.required]]
    },
      { validators: compararSenha() });
    this.selectPerfil();
    this.selectTipo();

  }

  desabilitarCampos() {
    let selecionado = this.form.controls.perfil;
    if (selecionado.value.label != "Parceiro" && selecionado.value.label != "Vendedor Parceiro") {
      this.disabled = false;

      let controles = this.form.controls;
      controles.ddd1_telefone1.setValue("");
      controles.ddd2_telefone2.setValue("");
      controles.ddd3_telefone3.setValue("");
      return;
    }
    this.disabled = true;



  }

  atualizar() {
    if (!this.validacaoFormGroup.validaForm(this.form)) return;

    console.log("passou");
    //
  }

  celular = false;
  celular2 = false;
  celular3 = false;

}

export function compararSenha(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.get('senha') && control.get('confirmacao')) {
      let senha: string = control.get('senha').value;
      const confirmacao: string = control.get('confirmacao').value;

      if ((!!senha && !!confirmacao) && (senha.length >= 5 && confirmacao.length >= 5)) {
        if (senha === confirmacao) {
          control.get('confirmacao').setErrors(null);
          return null;
        }
        else {
          control.get('confirmacao').setErrors({ confirmacao: true });
          return { teste: true };
        }
      }

    }
    return null;
  }
}