import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
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
    private readonly lojasService: LojasService
    ) { }

  public form: FormGroup;
  public apelido: string;
  public usuario = new Usuario();
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
          this.usuariosService.buscarTodosUsuarios().then((r) => {
            if (!!r) {
              let usuarios: Usuario[] = r;
              //this.usuario = usuarios.filter(usuario => usuario.apelido == this.apelido)[0];
              this.criarForm();

              const datastamp = this.usuario.senha;
              const senhaConvertida = this.criptoService.decodificaDado(datastamp, 1209);
              this.form.controls.senha.setValue(senhaConvertida);
              this.form.controls.confirmacao.setValue(senhaConvertida);
            }
          });
        }
      }
  }

  criarForm() {
    this.form = this.fb.group({
      nome: [this.usuario.nome, [Validators.required, Validators.maxLength(40)]],
      email: [this.usuario.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      senha: [this.usuario.senha, [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      confirmacao: [this.usuario.senha, [Validators.required, Validators.minLength(5)]],
      ddd_telefone: [this.usuario.telefone, [Validators.minLength(10), Validators.maxLength(11)]],
      dddCel_telefoneCel: [this.usuario.celular, [Validators.minLength(10), Validators.maxLength(11)]],
      ativo: [this.usuario.ativo, Validators.required]
    },
      { validators: compararSenha() });

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

    let f = this.form.controls;
    this.usuario.nome = f.nome.value;
    this.usuario.ativo = ( f.ativo.value =="true");
    this.usuario.email = f.email.value;
    this.usuario.senha = f.senha.value;
    //this.usuario.cpf_cnpj = f.cpf_cnpj.value;
    this.usuario.telefone = f.ddd_telefone.value;
    this.usuario.celular = f.dddCel_telefoneCel.value;

    if(this.usuario.id){
      this.usuariosService.alterarUsuario(this.usuario)
      .toPromise()
      .then((x) => {
        alert("xx");
      })
      .catch(()=>{
        alert("yy");
      });
    }else{
    this.usuariosService.cadastrarUsuario(this.usuario)
    .toPromise()
    .then((x) => {
      alert("x");
    })
    .catch(()=>{
      alert("y");
    });
    }

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
