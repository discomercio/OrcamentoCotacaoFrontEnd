import { Component, OnInit } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly appComponent: AppComponent) { }

  ngOnInit(): void {
  }

  senha: string;
  email_usuario: string;
  lembrar = false;

  login() {
    let msg = "";
    let usuario = this.email_usuario;
    let senha = this.senha;
    // this.fazendoLogin = true;
    this.autenticacaoService.authLogin(usuario, senha, this.lembrar,
      () => { this.desligarFazendoLoginFOrmulario(); },
      
      this.router, this.appComponent);
  }

  desligarFazendoLoginFOrmulario(): void {
    // this.fazendoLogin = false;
  }

}
