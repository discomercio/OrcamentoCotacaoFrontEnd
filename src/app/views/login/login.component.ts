import { Component, OnInit, ViewChild, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Router } from '@angular/router';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { SelectItem } from 'primeng/api';
import { InputArClubeComponent } from 'src/app/components/input/input-arclube.component';
import { DropdownArClubeComponent } from 'src/app/components/dropdown/dropdown-arclube.component';
import { ButtonArClubeComponent } from 'src/app/components/button/button-arclube.component';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { LoginRequest } from 'src/app/dto/login/login-request';

//Components


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild(InputArClubeComponent, { static: false })
  input: InputArClubeComponent

  @ViewChild(DropdownArClubeComponent, { static: false })
  dropdown: DropdownArClubeComponent

  @ViewChild(ButtonArClubeComponent, { static: false })
  button: ButtonArClubeComponent

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private readonly sweetalertService: SweetalertService,
    private readonly mensagemService: MensagemService,) { }
  //public toast: Toast

  ngOnInit(): void {

  }

  ngAfterViewInit() {

    // intial Number
    let i: number = 0;
    const tagName = "INPUT BUTTON SELECT";

    this.elementRef.nativeElement.querySelectorAll('*').forEach(
      x => {
        x.tabIndex = -1;
        if (tagName.match(x.tagName)) {
          i = i + 1;
          this.renderer.setAttribute(x, "tabIndex", i.toString());
        }
      }
    );
  }


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.which == 13 || event.keyCode == 13) {
      if (this.usuario && this.senha) {
        this.login();
      }
    }
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    const t = this.elementRef.nativeElement.querySelector('[tabindex="2"]').focus();
  }

  senha: string;
  usuario: string;
  loja: string;
  lojasUsuario: SelectItem[] = [];
  mostrarLoja: boolean = false;
  autenticou: boolean = false;
  lembrar = false;
  carregando: boolean;
  tokenUsuarioInterno: string;

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
      this.autenticacaoService.setarToken(this.tokenUsuarioInterno);
      sessionStorage.setItem("lojaLogada", this.loja);
      sessionStorage.setItem("lojas", this.autenticacaoService._lojasUsuarioLogado.toString());
      this.autenticacaoService._lojaLogado = this.loja;

      this.router.navigate(['dashboards']);
      return;
    }
    this.carregando = true;
    this.button.disabled = true;

    let request = new LoginRequest();
    request.usuario = this.usuario;
    request.senha = this.senha;
    this.autenticacaoService.authLogin2(request).toPromise().then((r) => {

      if (!r.Sucesso) {
        this.mensagemService.showErrorViaToast([r.Mensagem]);
        this.button.disabled = false;
        this.carregando = false;
        return;
      }

      if (!this.autenticacaoService.readToken(r.AccessToken)) {
        this.mensagemService.showErrorViaToast(["Ops! Tivemos um problema!"]);
        this.button.disabled = false;
        this.carregando = false;
        return;
      }

      if (this.autenticacaoService._lojasUsuarioLogado.length > 1) {
        this.mostrarLoja = true;
        this.montarSelectLoja();
        this.tokenUsuarioInterno = r.AccessToken;
        this.autenticou = true;
        this.mensagemService.showSuccessViaToast("Precisamos que selecione uma loja!");
        this.button.disabled = false;
        this.carregando = false;
        return;
      }

      this.autenticacaoService.setarToken(r.AccessToken);
      this.carregando = false;

      this.autenticacaoService.buscarEstilo(this.autenticacaoService._lojaLogado);

      this.router.navigate(['dashboards']);
    }).catch((e) => {
      this.button.disabled = false;
      this.carregando = false;
      this.autenticacaoService.tratarErros(e);
      return;
    });
  }

  montarSelectLoja() {
    this.lojasUsuario = [];
    this.autenticacaoService._lojasUsuarioLogado.forEach(x => {
      let item: SelectItem = { label: x, value: x };
      this.lojasUsuario.push(item);
    });
  }

}
