import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CriptoService } from 'src/app/utilities/cripto/cripto.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { UsuarioTipo } from 'src/app/dto/usuarios/UsuarioTipo';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
@Component({
  selector: 'app-usuario-edicao',
  templateUrl: './usuario-edicao.component.html',
  styleUrls: ['./usuario-edicao.component.scss']
})

export class UsuarioEdicaoComponent implements OnInit {

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly mensagemService: MensagemService,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly criptoService: CriptoService,
    private readonly alertaService: AlertaService,
  ) { }

  public form: FormGroup;
  public apelido: string;
  public usuario = new Usuario();
  public mensagemErro: string = "*Campo obrigatório.";
  public novoUsuario: boolean = false;
  disabled: boolean = true;
  public formataTelefone = FormataTelefone;
  public mascaraTelefone: string;
  tipo: UsuarioTipo = 'todos';

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['orcamentos/listar/orcamentos']);
      return;
    }
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.apelido = this.activatedRoute.snapshot.params.apelido;
    this.criarForm();

    if (this.apelido == "novo") {
      this.novoUsuario = true;
    }

    if (this.apelido.toLowerCase() != "")
      if (!!this.apelido) {
        if (this.apelido.toLowerCase() != "novo") {
          this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorId(this.apelido).toPromise().then((r) => {
            if (!!r) {
              this.usuario = r;
              this.criarForm();

              // const datastamp = this.usuario.senha;
              // const senhaConvertida = this.criptoService.decodificaDado(datastamp, 1209);
              // this.form.controls.senha.setValue(senhaConvertida);
              // this.form.controls.confirmacao.setValue(senhaConvertida);
            }
          });
        }
      }
  }

  criarForm() {
    this.form = this.fb.group({
      nome: [this.usuario.nome, [Validators.required, Validators.maxLength(40)]],
      email: [this.usuario.email, [Validators.required, Validators.email, Validators.maxLength(60)]],
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
    if (!this.validacaoFormularioService.validaForm(this.form)) return;

    let f = this.form.controls;
    this.usuario.nome = f.nome.value;
    this.usuario.ativo = (f.ativo.value == true);
    this.usuario.email = f.email.value;
    this.usuario.senha = f.senha.value;
    this.usuario.telefone = f.ddd_telefone.value;
    this.usuario.celular = f.dddCel_telefoneCel.value;
    this.usuario.parceiro = this.autenticacaoService._parceiro;

    if (this.usuario.id) {
      this.orcamentistaIndicadorVendedorService.atualizar(this.usuario)
        .toPromise()
        .then((x) => {
          this.mensagemService.showSuccessViaToast("Atualizado com sucesso!");
          this.router.navigate([`/usuarios/usuario-lista`]);
        })
        .catch((e) => {
          this.alertaService.mostrarErroInternet(e);
        });
    } else {
      this.orcamentistaIndicadorVendedorService.cadastrar(this.usuario)
        .toPromise()
        .then((x) => {
          this.mensagemService.showSuccessViaToast("Cadastrado com sucesso!");
          this.router.navigate([`/usuarios/usuario-lista`]);
        })
        .catch((e) => {
          this.alertaService.mostrarErroInternet(e);
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
