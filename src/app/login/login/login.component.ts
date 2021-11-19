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
    // this.fazendoLogin = true;
    this.autenticacaoService.authLogin(this.email_usuario.trim().toUpperCase(), this.senha.trim().toUpperCase(), this.lembrar,
      () => { this.desligarFazendoLoginFOrmulario(); },
      
      this.router, this.appComponent);
  }

  desligarFazendoLoginFOrmulario(): void {
    // this.fazendoLogin = false;
  }

}
