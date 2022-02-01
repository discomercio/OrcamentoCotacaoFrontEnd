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
import { LoginResponse } from 'src/app/dto/login/login-response';

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
  public _lojasUsuarioLogado: Array<string> = null;
  public _permissoes: Array<string> = null;
  public _parceiro: string = null;
  public _vendedor: string = null;
  public _lojaLogado: string = null;

  public unidade_negocio: string = null;

  private renovacaoPendnete: boolean = false;

  public authLogin2(usuario: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.apiUrl + 'Account/Login', { login: usuario, senha: senha });
  }

  readToken(token: string): boolean {
    const user = jtw_decode(token) as any;
    this._lojasUsuarioLogado = this.getLojas(user.Lojas);

    if (!this._lojaLogado) {
      if (user && user.family_name && this._lojasUsuarioLogado.length < 2) {
        this._lojaLogado = this._lojasUsuarioLogado[0];
      }
      else {
        this._lojaLogado = sessionStorage.getItem("lojaLogada");
      }
    }
    this._usuarioLogado = (user && user.nameid) ? user.nameid : null;
    this._parceiro = (user && user.Parceiro) ? user.Parceiro : null;
    this._vendedor = (user && user.Vendedor) ? user.Vendedor : null;
    this._permissoes = (user && user.Permissoes) ? this.getPermissoes(user.Permissoes) : null;
    this.unidade_negocio = (user && user.unidade_negocio) ? user.unidade_negocio : null;

    return true;
  }

  getLojas(lojas: string): Array<string> {
    let lojasResponse = lojas.split(",");
    return lojasResponse;
  }

  getPermissoes(permissoes: string): Array<string> {
    let permissoesResponse = permissoes.split(",");
    return permissoesResponse;
  }

  tratarErros(erro: any): void {
    let msg: string[] = new Array();

    if (this.alertaService.mostrarErro412(erro)) return;
    msg.push("" + ((erro && erro.message) ? erro.message : erro.toString()));
    if (erro && erro.status === 400) msg.push("usuário e senha inválidos.");
    if (erro && erro.status === 403) msg.push("loja do usuário não possui unidade_negocio. Entre em contato com o suporte.");
    if (erro && erro.status === 0) msg.push("servidor de autenticação não disponível.");
    if (erro && erro.status === 500) msg.push("erro interno no servidor de autenticação.");

    this.mensagemService.showErrorViaToast(msg);
  }

  //Iremos usar mais tarde...
  public alterarSenha(usuario: string, senha: string, senhaNova: string, senhaNovaConfirma: string): Observable<any> {
    return this.http.post(environment.apiUrl + 'acesso/alterarSenha', {
      apelido: usuario, senha: senha, senhaNova: senhaNova,
      senhaNovaConfirma: senhaNovaConfirma
    });
  }

  get authUsuario(): string {
    if (!this.readToken(this.obterToken())) return null;
    return this._usuarioLogado;
  }

  public authLogout(): void {
    sessionStorage.setItem('token', "");
    localStorage.setItem('token', "");

    localStorage.removeItem('token');
    this._usuarioLogado = null;
    this.unidade_negocio = null;
  }

  public setarToken(token: string): void {
    if (this.salvar) {
      localStorage.setItem("token", token);
      sessionStorage.setItem('token', "");
    }
    else {
      sessionStorage.setItem("token", token);
      localStorage.setItem('token', "");
    }
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

  // public renovarTokenSeNecessario(): void {
  //   /* const token = this.obterToken();
  //   if (!token)
  //     return;
  //   if (token.trim() == "")
  //     return;
  //   if (this.renovacaoPendnete)
  //     return;
  //   const user = jtw_decode(token) as any;
  //   const expira: Date = new Date(user.exp * 1000);
  //   const milisegexpira: number = (expira as any) - (new Date() as any);
  //   var segexpira = milisegexpira / 1000;
  //   if (segexpira < environment.minutosRenovarTokenAntesExpirar * 60)
  //     this.renovarToken(); */
  // }
  // private renovarToken(): void {
  //   this.renovacaoPendnete = true;
  //   this.http.get(environment.apiUrl + 'acesso/RenovarToken', { responseType: 'text' }).subscribe(
  //     {
  //       next: (e) => {
  //         this.setarToken(e as string);
  //         this.desligarRenovacaoPendente();
  //       },
  //       error: () => { this.desligarRenovacaoPendente(); },
  //       complete: () => { this.desligarRenovacaoPendente(); }
  //     }
  //   );
  // }

  // private desligarRenovacaoPendente() {
  //   //desligamos com timeou tpoque a solicitação da renovação do token também pode disparar outra renovação do token
  //   setTimeout(() => { this.renovacaoPendnete = false; }, 500);
  // }
}
