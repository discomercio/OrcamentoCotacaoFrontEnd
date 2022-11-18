import { lojaEstilo } from './../../dto/lojas/lojaEstilo';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jtw_decode from 'jwt-decode'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { LoginResponse } from 'src/app/dto/login/login-response';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { Constantes } from 'src/app/utilities/constantes';
import { SelectItem } from 'primeng/api';
import { LojasService } from '../lojas/lojas.service';
import { Title } from "@angular/platform-browser";
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { usuarioSenhaResponse } from 'src/app/dto/usuarios/usuarioSenhaResponse';
import { expiracaoSenhaResponse } from 'src/app/dto/usuarios/expiracaoSenhaResponse';
import { AppComponent } from 'src/app/main/app.component';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {

  constructor(private readonly http: HttpClient,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    private readonly lojaService: LojasService,
    private titleService: Title,
    private appComponent: AppComponent,
    private appSettingsService: AppSettingsService) { }

  salvar: boolean = false;
  usuario: Usuario;
  public lembrarSenhaParaAlterarSenha: boolean;
  public senhaExpirada: boolean = false;
  public _usuarioLogado: string = null;
  public _permissoes: Array<string> = null;
  public _parceiro: string = null;
  public _vendedor: string = null;
  public _lojaLogado: string = null;
  public unidade_negocio: string = null;
  public constantes: Constantes = new Constantes();
  public _lojasUsuarioLogado: Array<string> = (sessionStorage.getItem('lojas') ? sessionStorage.getItem('lojas').split(',') : null);
  public _lojaEstilo: lojaEstilo = new lojaEstilo();
  public _idUsuarioLogado: number;
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  public _tipoUsuario: number;

  public authLogin2(usuario: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.appSettingsService.config.apiUrl + 'Account/Login', { login: usuario, senha: senha });
  }

  readToken(token: string): boolean {
    const user = jtw_decode(token) as any;
    this._lojasUsuarioLogado = (user && user.Lojas) ? user.Lojas.split(",") : null;
    this._usuarioLogado = (user && user.nameid) ? user.nameid : null;
    this._parceiro = (user && user.Parceiro) ? user.Parceiro : null;
    this._vendedor = (user && user.Vendedor) ? user.Vendedor : null;
    this._permissoes = (user && user.Permissoes) ? user.Permissoes.split(",") : null;
    this.unidade_negocio = (user && user.unidade_negocio) ? user.unidade_negocio : null;
    this._tipoUsuario = (user && user.TipoUsuario) ? user.TipoUsuario : null;
    this._idUsuarioLogado = (user && user.Id) ? user.Id : 0;
    
    if (!this._lojaLogado) {
      if (user && user.family_name && this._lojasUsuarioLogado.length < 2) {
        this._lojaLogado = this._lojasUsuarioLogado[0];
      }
      else {
        this._lojaLogado = sessionStorage.getItem("lojaLogada");
      }
    }

    return true;
  }

  buscarEstilo(loja) {
    this.lojaService.buscarLojaEstilo(loja).toPromise().then((r) => {
      if (!!r) {
        this._lojaEstilo.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;
        this._lojaEstilo.corCabecalho = r.corCabecalho + " !important";
        this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
        this.titleService.setTitle(r.titulo);
      }
    });
  }

  montaListaLojas() {
    if (sessionStorage.getItem('lojas')) {
      // sessionStorage.getItem('lojas').split(',')
      // .forEach(x => {
      //     let item: SelectItem = { label: x, value: x };
      // this._lojasUsuarioLogado.push(item);
      // }
    }
  }

  getUsuarioDadosToken(): Usuario {
    if (this.readToken(this.obterToken())) {
      this.usuario = new Usuario();
      if (this._usuarioLogado) {
        
        this.usuario.id = this._idUsuarioLogado;
        this.usuario.nome = this._usuarioLogado;
        this.usuario.permissoes = this._permissoes;
        this.usuario.idVendedor = this._vendedor;
        this.usuario.idParceiro = this._parceiro;
        this.usuario.loja = this._lojaLogado;
        this.usuario.lojas = this._lojasUsuarioLogado;
      }
    }

    return this.usuario
  }

  tratarErros(erro: any): void {
    let msg: string[] = new Array();

    if (this.alertaService.mostrarErro412(erro)) return;

    msg.push("" + ((erro && erro.message) ? erro.message : erro.toString()));

    if (erro && erro.status === 400) {
      if (erro && erro.error && erro.error.Message) {
        msg.push(erro.error.Message);
      } else {
        msg.push("usuário ou senha inválidos.");
      }
    }
    if (erro && erro.status === 403) msg.push("loja do usuário não possui unidade_negocio. Entre em contato com o suporte.");
    if (erro && erro.status === 0) msg.push("servidor de autenticação não disponível.");
    if (erro && erro.status === 500) msg.push("erro interno no servidor de autenticação.");

    this.mensagemService.showErrorViaToast(msg);
  }

  public alterarSenha(usuario: string, senha: string, senhaNova: string, senhaNovaConfirma: string): Observable<any> {
    return this.http.post(this.appComponent._apiURL + 'acesso/alterarSenha', {
      apelido: usuario, senha: senha, senhaNova: senhaNova,
      senhaNovaConfirma: senhaNovaConfirma
    });
  }

  get authUsuario(): string {
    if (!this.readToken(this.obterToken())) return null;
    return this._usuarioLogado;
  }

  public authLogout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('lojas');
    sessionStorage.removeItem('lojaLogada');
    this._usuarioLogado = null;
    this.unidade_negocio = null;
  }

  public setarToken(token: string): void {
    if (this.salvar) {
      sessionStorage.setItem('token', "");
    }
    else {
      sessionStorage.setItem("token", token);
    }
  }

  public obterToken(): string {
    var ret = this.obterTokenInterno();
    if (ret && ret.toString().length < 3)
      ret = null;
    return ret;
  }

  private obterTokenInterno(): string {
    var ret = sessionStorage.getItem("token");
    if (ret && ret.trim() != "") {
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

  verificarPermissoes(permissao: ePermissao): boolean {

    if (!this.usuario.permissoes.includes(permissao)) return false;

    return true;
  }

  public AtualzarSenha(tipoUsuario: number, usuario: string, senha: string, novaSenha: string, confirmacaSenha: string): Observable<usuarioSenhaResponse> {
    return this.http.post<usuarioSenhaResponse>(this.appComponent._apiURL + 'Account/AtualzarSenha',
      {
        tipoUsuario: tipoUsuario,
        apelido: usuario,
        senha: senha,
        novaSenha: novaSenha,
        confirmacaoSenha: confirmacaSenha
      });
  }

  public verificarExpiracao(tipoUsuario: number, usuario: string): Observable<expiracaoSenhaResponse> {
    return this.http.post<usuarioSenhaResponse>(this.appComponent._apiURL + 'Account/expiracao',
      {
        tipoUsuario: tipoUsuario,
        apelido: usuario
      });
  }

}