import { Component, OnInit } from '@angular/core';
import { UsuarioSenha } from 'src/app/dto/usuarios/UsuarioSenha';
import { AutenticacaoService } from '../../service/autenticacao/autenticacao.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CriptoService } from 'src/app/utilities/cripto/cripto.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';

@Component({
  selector: 'app-senha-meusdados',
  templateUrl: './senha-meusdados.component.html',
  styleUrls: ['./senha-meusdados.component.scss']
})
export class SenhaMeusdadosComponent implements OnInit {

    constructor(
      public readonly autenticacaoService: AutenticacaoService,
      public readonly validacaoFormularioService: ValidacaoFormularioService,
      private fb: FormBuilder,
      private readonly criptoService: CriptoService,
      private readonly mensagemService: MensagemService,)
      { }
      
      public usuarioSenha: UsuarioSenha;
      public form: FormGroup;
      public mensagemErro: string = "*Campo obrigatório.";
  
      ngOnInit(): void {
          this.usuarioSenha = new UsuarioSenha();
          this.criarForm();
  
          if(this.autenticacaoService._usuarioLogado) {
            this.usuarioSenha.nome = this.autenticacaoService._usuarioLogado;
            this.usuarioSenha.tipoUsuario = this.autenticacaoService._tipoUsuario;
            this.usuarioSenha.senha = "";
            this.usuarioSenha.novaSenha = "";
            this.usuarioSenha.confirmacaoSenha = "";
          }
      }

      criarForm() {
        this.form = this.fb.group({
          senha: [this.usuarioSenha.senha, [Validators.required]],
          novaSenha: [this.usuarioSenha.novaSenha, [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
          confirmacao: [this.usuarioSenha.confirmacaoSenha, [Validators.required, Validators.minLength(8), Validators.maxLength(15)]]
        })
      }

      atualizar() {
        if (!this.validacaoFormularioService.validaForm(this.form)){
          return;
        }

        var chave = this.criptoService.gerarChave();

        let f = this.form.controls;
        this.usuarioSenha.tipoUsuario = this.autenticacaoService._tipoUsuario;
        this.usuarioSenha.nome = this.autenticacaoService._usuarioLogado;
        this.usuarioSenha.senha = this.criptoService.CodificaSenha(f.senha.value,  chave);
        this.usuarioSenha.novaSenha = this.criptoService. CodificaSenha(f.novaSenha.value,  chave);
        this.usuarioSenha.confirmacaoSenha = this.criptoService.CodificaSenha(f.confirmacao.value,  chave);
        
        this.autenticacaoService.AtualzarSenha(
          this.usuarioSenha.tipoUsuario,
          this.usuarioSenha.nome,
          this.usuarioSenha.senha,
          this.usuarioSenha.novaSenha,
          this.usuarioSenha.confirmacaoSenha)
          .toPromise()
          .then((x) => {
            this.mensagemService.showSuccessViaToast(x.MensagemRetorno);

            let controles = this.form.controls;
            controles.senha.setValue("");
            controles.novaSenha.setValue("");
            controles.confirmacao.setValue("");
          })
          .catch((e) => {
            console.log(e.error);
            var mensagensErro = new Array<string>();
            mensagensErro.push(e.error)

            this.mensagemService.showErrorViaToast(mensagensErro);
          });
      }
}