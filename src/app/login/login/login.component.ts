import { Component, OnInit } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly appComponent: AppComponent,
    private readonly mensagemService: MensagemService) { }

  ngOnInit(): void {
  }

  senha: string;
  usuario: string;
  loja: string;
  lojasUsuario: SelectItem[] = [];
  mostrarLoja: boolean = false;
  autenticou: boolean = false;
  lembrar = false;

  login() {
    if (!this.usuario || !this.senha) {
      this.mensagemService.showErrorViaToast(["É necessário prencher usuário e senha!"]);
      return;
    }

    if (!this.loja && this.mostrarLoja) {
      this.mensagemService.showWarnViaToast("Precisamos que selecione uma loja!");
      return;
    }
    if (!!this.loja && this.mostrarLoja) {
      sessionStorage.setItem("lojaLogada", this.loja);
      this.autenticacaoService._lojaLogado = this.loja;

      this.router.navigate(['']);
      return;
    }

    this.autenticacaoService.authLogin2(this.usuario, this.senha).toPromise().then((r) => {
      if (r != null) {
        if (!this.autenticacaoService.readToken(r.AccessToken)) {
          this.mensagemService.showErrorViaToast(["Ops! Tivemos um problema!"]);
          return;
        }

        if (this.autenticacaoService._lojasUsuarioLogado.length > 1) {
          this.mostrarLoja = true;
          this.montarSelectLoja();
          this.autenticacaoService.setarToken(r.AccessToken);
          this.mensagemService.showWarnViaToast("Precisamos que selecione uma loja!");
          return;
        }

        this.autenticacaoService.setarToken(r.AccessToken);
        this.router.navigate(['']);
      }
    }).catch((e) => {
      this.autenticacaoService.tratarErros(e);
      return;
    });
  }

  montarSelectLoja() {
    this.autenticacaoService._lojasUsuarioLogado.forEach(x => {
      let item: SelectItem = { label: x, value: x };
      this.lojasUsuario.push(item);
    });
  }
  desligarFazendoLoginFOrmulario(): void {
    // this.fazendoLogin = false;
  }

}
