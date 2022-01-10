import { Injectable, DebugElement } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import jtw_decode from 'jwt-decode'

import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {

  constructor(private readonly http: HttpClient, private readonly location: Location,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    private readonly router: Router
  ) {
  }

  public lembrarSenhaParaAlterarSenha: boolean;
  public senhaExpirada: boolean = false;
  salvar: boolean = false;


  public _usuarioLogado: string = null;
  public _tipoUsuario: number = null;
  public _parceiro: string = null;
  public _vendedor:string = null;

  public unidade_negocio: string = null;

  private renovacaoPendnete: boolean = false;

  get authNomeUsuario(): number {
    if (this._tipoUsuario == null) {
      const token = this.obterToken();
      const user = jtw_decode(token) as any;
      this._tipoUsuario = (user && user.TipoUsuario) ? Number.parseInt(user.TipoUsuario) : null;
      this._usuarioLogado = (user && user.unique_name) ? user.unique_name : null;
      this._parceiro = (user && user.Parceiro) ? user.Parceiro : null;
      this._vendedor = (user && user.Vendedor) ? user.Vendedor : null;
    }
    return this._tipoUsuario;
  }


  public alterarSenha(usuario: string, senha: string, senhaNova: string, senhaNovaConfirma: string): Observable<any> {
    return this.http.post(environment.apiUrl + 'acesso/alterarSenha', {
      apelido: usuario, senha: senha, senhaNova: senhaNova,
      senhaNovaConfirma: senhaNovaConfirma
    });
  }

  public authLogin(usuario: string, senha: string, salvar: boolean, desligarFazendoLogin: () => void, router: Router, appComponent: AppComponent): void {
    this.lembrarSenhaParaAlterarSenha = salvar;
    this.salvar = salvar;
    this._usuarioLogado = null;
    let msg:string[] = new Array();

    this.http.post(environment.apiUrl + 'Account/Login', { login: usuario, senha: senha },
      {
        responseType: 'text',
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'responseType': 'text' })
      }).subscribe({
        next: (e) => {
          this._usuarioLogado = usuario;
          if (e.toString().length == 1) {

          }
          var objToken = JSON.parse(e);

          this.setarToken(objToken.accessToken);
          this._usuarioLogado = objToken.usuario.nome;
          this._tipoUsuario = objToken.usuario.tipoUsuario;
          this._parceiro = objToken.usuario.parceiro;
          this._vendedor = objToken.usuario.IdVendedor;
          this.router.navigate(['']);
        }
        ,
        error: (e) => {
          desligarFazendoLogin();
          if (this.alertaService.mostrarErro412(e))
            return;
          msg.push("" + ((e && e.message) ? e.message : e.toString()));
          if (e && e.status === 400)
            msg.push("usuário e senha inválidos.");
          if (e && e.status === 403)
            msg.push("loja do usuário não possui unidade_negocio. Entre em contato com o suporte.");
          if (e && e.status === 0)
            msg.push("servidor de autenticação não disponível.");
          if (e && e.status === 500)
            msg.push("erro interno no servidor de autenticação.");

          this.mensagemService.showErrorViaToast(msg);

        },
      })
  }



  public authLogout(): void {
    sessionStorage.setItem('token', "");
    localStorage.setItem('token', "");

    localStorage.removeItem('token');
    this._usuarioLogado = null;
    this.unidade_negocio = null;
  }

  public setarToken(token: string): void {
    ;
    if (this.salvar) {
      localStorage.setItem("token", token);
      sessionStorage.setItem('token', "");
    }
    else {
      sessionStorage.setItem("token", token);
      localStorage.setItem('token', "");
    }
  }

  public gerarChave() {
    // gerar chave
    const fator: number = 1209;
    const cod_min: number = 35;
    const cod_max: number = 96;
    const tamanhoChave: number = 128;

    let chave: string = "";

    for (let i: number = 1; i < tamanhoChave; i++) {
      let k: number = (cod_max - cod_min) + 1;
      k *= fator;
      k = (k * i) + cod_min;
      k %= 128;
      chave += String.fromCharCode(k);
    }

    return chave;
  }

  public CodificaSenha(origem: string, chave: string): string {

    let i: number = 0;
    let i_chave: number = 0;
    let i_dado: number = 0;
    let s_origem: string = origem;
    let letra: string = "";
    let s_destino: string = "";

    if (s_origem.length > 15) {
      s_origem = s_origem.substr(0, 15);
    }

    for (i = 0; i < s_origem.length; i++) {
      letra = chave.substr(i, 1);
      i_chave = (letra.charCodeAt(0) * 2) + 1;
      i_dado = s_origem.substr(i, 1).charCodeAt(0) * 2;
      let contaMod = i_chave ^ i_dado;
      s_destino += String.fromCharCode(contaMod);
    }

    s_origem = s_destino;
    s_destino = "";
    let destino = "";

    for (i = 0; i < s_origem.length; i++) {
      letra = s_origem.substr(i, 1);
      i_chave = letra.charCodeAt(0);
      let hexNumber = i_chave.toString(16);

      while (hexNumber.length < 2) {
        hexNumber = hexNumber.padStart(2, '0');
      }
      destino += hexNumber;
    }
    while (destino.length < 30) {
      destino = "0" + destino;
    }
    s_destino = "0x" + destino;
    return s_destino;
  }

  public obterToken(): string {
    var ret = this.obterTokenInterno();
    //menos de 3 caracteres consiederamos algum codigo de erro
    if (ret && ret.toString().length < 3)
      ret = null;
    return ret;
  }
  private obterTokenInterno(): string {
    //tentamos nos dois lugares, primeiro na local
    var ret = localStorage.getItem("token");
    if (ret && ret.trim() != "") {
      //precisamos definir onde guardamos quando vier a renovação do token
      this.salvar = true;
      return ret;
    }
    return sessionStorage.getItem("token");
  }

  public authEstaLogado(): boolean {
    const token = this.obterToken();

    if (!token)
      return false;
    if (token.trim() == "")
      return false;

    return true;
  }

  public renovarTokenSeNecessario(): void {
    /* const token = this.obterToken();
    if (!token)
      return;
    if (token.trim() == "")
      return;
    if (this.renovacaoPendnete)
      return;
    const user = jtw_decode(token) as any;
    const expira: Date = new Date(user.exp * 1000);
    const milisegexpira: number = (expira as any) - (new Date() as any);
    var segexpira = milisegexpira / 1000;
    if (segexpira < environment.minutosRenovarTokenAntesExpirar * 60)
      this.renovarToken(); */
  }
  private renovarToken(): void {
    this.renovacaoPendnete = true;
    this.http.get(environment.apiUrl + 'acesso/RenovarToken', { responseType: 'text' }).subscribe(
      {
        next: (e) => {
          this.setarToken(e as string);
          this.desligarRenovacaoPendente();
        },
        error: () => { this.desligarRenovacaoPendente(); },
        complete: () => { this.desligarRenovacaoPendente(); }
      }
    );
  }

  private desligarRenovacaoPendente() {
    //desligamos com timeou tpoque a solicitação da renovação do token também pode disparar outra renovação do token
    setTimeout(() => { this.renovacaoPendnete = false; }, 500);
  }
}
