import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import jtw_decode from 'jwt-decode'

import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';
// import { Constantes } from 'src/app/dto/Constantes';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {

  constructor(private readonly http: HttpClient, private readonly location: Location,
    private readonly alertaService: AlertaService) {
    this.carregarLayout();
  }


  public alterarSenha(usuario: string, senha: string, senhaNova: string, senhaNovaConfirma: string): Observable<any> {
    return this.http.post(environment.apiUrl + 'acesso/alterarSenha', {
      apelido: usuario, senha: senha, senhaNova: senhaNova,
      senhaNovaConfirma: senhaNovaConfirma
    });
  }

  // constantes = new Constantes();
  // public usuarioApelidoParaAlterarSenha: string;
  public lembrarSenhaParaAlterarSenha: boolean;
  public senhaExpirada: boolean = false;
  salvar: boolean = false;
  public authLogin(usuario: string, senha: string, salvar: boolean, desligarFazendoLogin: () => void, router: Router, appComponent: AppComponent): void {
    this.lembrarSenhaParaAlterarSenha = salvar;
    // this.usuarioApelidoParaAlterarSenha = usuario; = _NomeUsuario
    var key = this.gerarChave();
    senha = this.CodificaSenha(senha, key);
    this.salvar = salvar;
    this._NomeUsuario = null;
    let msg = "";
    debugger;
    this.http.post(environment.apiUrl + 'Account/Login', { apelido: usuario, senha: senha },
      {
        //estamos usando dessa forma, pois não estava aceitando uma "options" com mais de um parametro
        responseType: 'text',
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'responseType': 'text' })
      }).subscribe({
        next: (e) => {
          /*
            estamos atribuindo o nome do usuário para, caso o usuário esteja 
            fazendo o primeiro acesso ele terá que alterar a senha 
            Na validação da alteração de senha é feito a comparação da nova senha com o nome do usuário, 
            pois a senha não pode ser o nome de usuário
          */
          //No caso de primeiro acesso retornamos o código "4"
          this._NomeUsuario = usuario;

          //aqui vai as condições que irão verificar se o retorno é um erro
          if (e.toString().length == 1) {
            // if (e.toString() == this.constantes.ERR_USUARIO_BLOQUEADO) {
            //   msg = "ACESSO NEGADO";
            //   desligarFazendoLogin();

            //   _snackBar.open("Erro no login: " + msg, undefined, {
            //     duration: environment.esperaErros
            //   });
            //   return;
            // }
            // if (e.toString() == this.constantes.ERR_IDENTIFICACAO_LOJA) {
            //   msg = "OS DADOS INFORMADOS ESTÃO INCORRETOS.<BR>(Loja inválida)";
            //   desligarFazendoLogin();

            //   _snackBar.open("Erro no login: " + msg, undefined, {
            //     duration: environment.esperaErros
            //   });
            //   return;
            // }

            // if (e.toString() == this.constantes.ERR_SENHA_EXPIRADA) {
            //   this.senhaExpirada = true;
            //   router.navigateByUrl('/alterarsenha');
            //   return;
            // }

          }

          //nunca desligamos o fazendo login porque, quando fizer, já vai para outra página, então nao fazemos this.fazendoLogin = false;
          this.setarToken(e);

          //o carregarEstilo já navega para a home
          // appComponent.carregarEstilo(true);
        }
        ,
        error: (e) => {
          desligarFazendoLogin();
          if (this.alertaService.mostrarErro412(e))
            return;
          msg = "" + ((e && e.message) ? e.message : e.toString());
          if (e && e.status === 400)
            msg = "usuário e senha inválidos."
          if (e && e.status === 403)
            msg = "loja do usuário não possui unidade_negocio. Entre em contato com o suporte."
          if (e && e.status === 0)
            msg = "servidor de autenticação não disponível."
          if (e && e.status === 500)
            msg = "erro interno no servidor de autenticação."


          // _snackBar.open("Erro no login: " + msg, undefined, {
          //   duration: environment.esperaErros
          // });

        },
      })
  }

  public authLogout(): void {
    this.authLogoutSemLayout();
    this.loja = null;
    this.unidade_negocio = null;
    this.carregarLayout();
  }

  public authLogoutSemLayout(): void {
    this.http.get(environment.apiUrl + 'acesso/fazerLogout').subscribe(
      e => {
        //nao fazemos nada..
      }
    );
    sessionStorage.setItem('token', "");
    localStorage.setItem('token', "");

    //remover a session dos parametros de busca que foram armazenados de Prepedido e Pedido
    sessionStorage.removeItem('data_inicial_prepedido');
    sessionStorage.removeItem('data_final_prepedido');
    sessionStorage.removeItem('data_inicial_pedido');
    sessionStorage.removeItem('data_final_pedido');
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
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

    this.carregarLayout();
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
    // if (token == this.constantes.ERR_USUARIO_BLOQUEADO)
    //   return false;

    const user = jtw_decode(token) as any;
    if (!user)
      return false;


    //passamos a exigir a unidade_negocio; se não tiver, tem que fazer o login com o novo formato
    if (!user.unidade_negocio)
      return false;

    //vamos ver se extá expirado  
    const expira: Date = new Date(user.exp * 1000);
    if (expira < new Date())
      return false;

    return true;
  }

  public _NomeUsuario: string = null;
  get authNomeUsuario(): string {
    if (this._NomeUsuario == null) {
      const token = this.obterToken();
      const user = jtw_decode(token) as any;
      this._NomeUsuario = (user && user.nameid) ? user.nameid : "não logado";
    }
    return this._NomeUsuario;
  }

  private renovacaoPendnete: boolean = false;
  public renovarTokenSeNecessario(): void {
    const token = this.obterToken();
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
      this.renovarToken();
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


  //Gabriel criar metodo para carregar o css
  public arquivoLogo(): string {
    return this._logo;
  }
  public arquivoEstilos(): string {
    return this._estilo;
  }
  private _estilo: string = null;
  private _logo: string = null;
  public loja: string = null;
  public unidade_negocio: string = null;

  private carregarLayout(): void {
    //tentamos obter a loja do token. se nao tiver, fica com null
    if (this.authEstaLogado()) {
      const token = this.obterToken();
      const user = jtw_decode(token) as any;
      this.loja = (user && user.family_name) ? user.family_name : null;
      this.unidade_negocio = (user && user.unidade_negocio) ? user.unidade_negocio : null;
    }

    //define o estilo e o logo baseado na loja
    if (this.loja == null || this.unidade_negocio == null) {
      this._estilo = "";
      this._logo = "";
      return;
    }

    if (this.unidade_negocio && this.unidade_negocio.toUpperCase().trim() == "BS") {
      //bonshop
      this._estilo = "assets/shopVendas.css";// -> é o Bonshop, mantivemos o nome para manter a compatibilidade durante a mudança
      this._logo = "assets/bonshop.png";
      this.CarregarIconBonshop();
      return;
    }

    if (this.unidade_negocio && this.unidade_negocio.toUpperCase().trim() == "VRF") {
      //unis
      this._estilo = "assets/Unis.css";
      this._logo = "assets/LogoUnis.png";
      this.CarregarIconUnis();
      return;
    }

    //nao deveria chegar aqui
    this._estilo = "";
    this._logo = "";
  }
  private CarregarIconUnis(): void {
    const head = document.getElementsByTagName('head')[0];
    let favicon = document.getElementById('favicon') as HTMLLinkElement;
    favicon.href = 'assets/icones/ico-unis-16x16.ico';
    head.appendChild(favicon);
  }

  private CarregarIconBonshop(): void {
    const head = document.getElementsByTagName('head')[0];
    let favicon = document.getElementById('favicon') as HTMLLinkElement;
    favicon.href = 'assets/icones/ico-bonshop.ico';
    head.appendChild(favicon);
  }

  public BuscarImgFundo(): string {
    if (this.unidade_negocio && this.unidade_negocio.toUpperCase().trim() == "BS") {
      //bonshop
      return "url('/assets/background-bonshop.jpg')";
    }

    if (this.unidade_negocio && this.unidade_negocio.toUpperCase().trim() == "VRF") {
      //unis
      return "url('/assets/background-unis-filtro-branco80.jpg')";
    }

    //nunca deveria chegar aqui, fallback
    return "url('/assets/background-bonshop.jpg')";
  }
  public buscarAlturaImg(): string {
    return "calc(100vh - 53px)";
  }

  public buscarTamanhoImg(): string {
    return "100%";
  }


}
