import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CriptoService } from 'src/app/utilities/cripto/cripto.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { UsuarioTipo } from 'src/app/dto/usuarios/UsuarioTipo';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { ValidacaoCustomizadaService } from 'src/app/utilities/validacao-customizada/validacao-customizada.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';

@Component({
  selector: 'app-usuario-edicao',
  templateUrl: './usuario-edicao.component.html',
  styleUrls: ['./usuario-edicao.component.scss']
})

export class UsuarioEdicaoComponent implements OnInit {

  constructor(
    private router: Router,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly mensagemService: MensagemService,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly criptoService: CriptoService,
    private readonly alertaService: AlertaService,
    private readonly validacaoCustomizadaService: ValidacaoCustomizadaService
  ) { }

  public form: FormGroup;
  public apelido: string;
  public parceiros: any[] = [];
  public usuario = new Usuario();
  public mensagemErro: string = "*Campo obrigatório.";
  public bloqueiaParceiro: boolean = true;
  disabled: boolean = true;
  public formataTelefone = FormataTelefone;
  public mascaraTelefone: string;
  tipo: UsuarioTipo = 'todos';
  usuarioInterno: boolean;
  parceiroSelecionado: string = 'Selecione';
  carregando: boolean;

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar)) {
      this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['orcamentos/listar/orcamentos']);
      return;
    }
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();

    this.apelido = this.activatedRoute.snapshot.params.apelido;
    this.criarForm();

    this.carregando = true;
    if (this.apelido == "novo") {
      this.bloqueiaParceiro = false;
    }

    if (this.apelido.toLowerCase() != "")
      if (!!this.apelido) {
        if (this.apelido.toLowerCase() != "novo") {

          this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorId(this.apelido).toPromise().then((r) => {
            if (!!r) {
              this.usuario = r;
              this.parceiroSelecionado = r.parceiro;
              this.criarForm();

              // Verifico se o usuário logado tem permissão para editar usuários de outro vendedor              
              if (!this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
                // Verifico se está tentando editar um vendedor que é do parceiro logado
                if (r.parceiro != this.autenticacaoService._usuarioLogado) {

                  // não tem permissão e está tentando editar um vendedor cujo usuário logado não é o responsável (O.o)
                  if (this.autenticacaoService._usuarioLogado != r.vendedorResponsavel) {
                    this.carregando = false;
                    this.sweetalertService.aviso("Ops...você não é responsável por este vendedor!");
                    window.history.back();
                  }
                }
              }
              this.carregando = false;
            }
          }).catch((e) => {

            this.carregando = false;
            this.alertaService.mostrarErroInternet(e);
          });
        }
      }

    // usuário interno
    if (this.autenticacaoService._tipoUsuario == 1) {
      this.usuarioInterno = true;

      let promise: any = [this.buscarParceiros()];
      Promise.all(promise).then((r: any) => {
        this.setarParceiros(r[0]);
      }).catch((e) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      }).finally(() => {
        this.carregando = false;
      });
    } else {
      this.carregando = false;
      this.usuarioInterno = false;
      this.form.controls.parceiro.setValue(this.autenticacaoService._parceiro);
    }
  }

  buscarParceiros(): Promise<OrcamentistaIndicadorDto[]> {
    if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
      return this.orcamentistaIndicadorService.buscarParceirosPorLoja(this.autenticacaoService._lojaLogado).toPromise();
    }
    else {
      return this.orcamentistaIndicadorService
        .buscarParceirosPorVendedor(this.autenticacaoService._usuarioLogado, this.autenticacaoService._lojaLogado).toPromise();
    }
  }

  setarParceiros(r: OrcamentistaIndicadorDto[]) {
    if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
      if (r != null) {
        let indice = 1;
        while (indice < r.length) {
          if (r[indice].nome != this.parceiroSelecionado) {
            this.parceiros.push({ label: r[indice].nome, value: r[indice].nome });
          }
          indice++;
        }
      }
    }
    else {
      if (r != null) {
        let indice = 1;
        while (indice < r.length) {
          this.parceiros.push({ label: r[indice].nome, value: r[indice].nome });
          indice++;
        }
      }
    }
  }

  onChangeParceiros(event) {
    this.parceiroSelecionado = event.value;
  }

  criarForm() {

    this.form = this.fb.group({
      nome: [this.usuario.nome, [Validators.required, Validators.maxLength(40)]],
      email: [this.usuario.email, [Validators.required, Validators.email, Validators.maxLength(60)]],
      senha: [this.usuario.senha, [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      confirmacao: [this.usuario.senha, [Validators.required, Validators.minLength(8)]],
      ddd_telefone: [this.usuario.telefone, [Validators.minLength(10), Validators.maxLength(11)]],
      dddCel_telefoneCel: [this.usuario.celular, [Validators.minLength(10), Validators.maxLength(11)]],
      ativo: [this.usuario.ativo, Validators.required],
      StLoginBloqueadoAutomatico: [this.usuario.StLoginBloqueadoAutomatico],
      parceiro: [this.usuario.parceiro, [Validators.required]]
    },
      { validators: this.validacaoCustomizadaService.compararSenha() });

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
    this.usuario.StLoginBloqueadoAutomatico = (f.StLoginBloqueadoAutomatico.value == true);
    this.usuario.email = f.email.value;
    this.usuario.senha = f.senha.value;
    this.usuario.telefone = f.ddd_telefone.value;
    this.usuario.celular = f.dddCel_telefoneCel.value;
    this.usuario.loja = this.autenticacaoService._lojaLogado;

    if (this.autenticacaoService._tipoUsuario == 1) {
      this.usuario.parceiro = this.parceiroSelecionado;
    } else {
      this.usuario.parceiro = this.autenticacaoService._parceiro;
    }

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
