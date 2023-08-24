import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AutenticacaoService } from '../../service/autenticacao/autenticacao.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CriptoService } from 'src/app/utilities/cripto/cripto.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { Router } from '@angular/router';
import { UsuarioSenha } from 'src/app/dto/usuarios/usuarioSenha';

@Component({
  selector: 'app-senha-meusdados',
  templateUrl: './senha-meusdados.component.html',
  styleUrls: ['./senha-meusdados.component.scss']
})
export class SenhaMeusdadosComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    public readonly autenticacaoService: AutenticacaoService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private fb: FormBuilder,
    private readonly criptoService: CriptoService,
    private readonly mensagemService: MensagemService,) { }


  @ViewChild("password") password: ElementRef;
  public usuarioSenha: UsuarioSenha;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  carregando: boolean;

  ngOnInit(): void {
    this.usuarioSenha = new UsuarioSenha();
    this.criarForm();

    if (this.autenticacaoService._usuarioLogado) {
      this.usuarioSenha.nome = this.autenticacaoService._usuarioLogado;
      this.usuarioSenha.tipoUsuario = this.autenticacaoService._tipoUsuario;
      this.usuarioSenha.senha = "";
      this.usuarioSenha.novaSenha = "";
      this.usuarioSenha.confirmacaoSenha = "";
    }
  }

  ngAfterViewInit() {
    this.password.nativeElement.focus();
    this.usuarioSenha.senha = "";
    this.usuarioSenha.novaSenha = "";
    this.usuarioSenha.confirmacaoSenha = "";
  }



  criarForm() {
    this.form = this.fb.group({
      senha: [this.usuarioSenha.senha, [Validators.required, Validators.pattern("^(?=.*[aA-zZ])(?=.*[0-9]).{8,15}$")]],
      novaSenha: ["", [Validators.required, Validators.pattern("^(?=.*[aA-zZ])(?=.*[0-9]).{8,15}$")]],
      confirmacao: [this.usuarioSenha.confirmacaoSenha, [Validators.required, Validators.pattern("^(?=.*[aA-zZ])(?=.*[0-9]).{8,15}$")]]
    })
  }

  atualizar() {
    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }

    this.carregando = true;
    var chave = this.criptoService.gerarChave();

    let f = this.form.controls;
    this.usuarioSenha.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.usuarioSenha.nome = this.autenticacaoService._usuarioLogado;
    this.usuarioSenha.senha = this.criptoService.CodificaSenha(f.senha.value, chave);
    this.usuarioSenha.novaSenha = this.criptoService.CodificaSenha(f.novaSenha.value, chave);
    this.usuarioSenha.confirmacaoSenha = this.criptoService.CodificaSenha(f.confirmacao.value, chave);

    this.autenticacaoService.AtualzarSenha(
      this.usuarioSenha.tipoUsuario,
      this.usuarioSenha.nome,
      this.usuarioSenha.senha,
      this.usuarioSenha.novaSenha,
      this.usuarioSenha.confirmacaoSenha)
      .toPromise()
      .then((x) => {
        if (x.Sucesso) {
          this.mensagemService.showSuccessViaToast(x.MensagemRetorno);
          sessionStorage.setItem("senhaExpirada", "N");
          setTimeout(() => {
            this.router.navigate(['dashboards']);
          }, 3500);
        }
        else {
          var mensagensErro = new Array<string>();
          mensagensErro.push(x.MensagemRetorno);
          this.mensagemService.showErrorViaToast(mensagensErro);
        }
        this.carregando = false;
      })
      .catch((e) => {
        this.carregando = false;
        var mensagensErro = new Array<string>();
        mensagensErro.push(e.error);

        this.mensagemService.showErrorViaToast(mensagensErro);
      });
  }
}