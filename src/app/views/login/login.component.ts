import { Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Router } from '@angular/router';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { SelectItem } from 'primeng/api';
import { InputArClubeComponent } from 'src/app/components/input/input-arclube.component';
import { DropdownArClubeComponent } from 'src/app/components/dropdown/dropdown-arclube.component';
import { ButtonArClubeComponent } from 'src/app/components/button/button-arclube.component';

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
    private readonly mensagemService: MensagemService,) { }
  //public toast: Toast

  ngOnInit(): void {
    
  }

  senha: string;
  usuario: string;
  loja: string;
  lojasUsuario: SelectItem[] = [];
  mostrarLoja: boolean = false;
  autenticou: boolean = false;
  lembrar = false;
  carregando: boolean;

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
      sessionStorage.setItem("lojas", this.autenticacaoService._lojasUsuarioLogado.toString());
      this.autenticacaoService._lojaLogado = this.loja;

      this.router.navigate(['orcamentos/listar/orcamentos']);
      return;
    }
    this.carregando = true;
    this.button.disabled = true;

    this.autenticacaoService.authLogin2(this.usuario, this.senha).toPromise().then((r) => {
      if (r != null) {

        if (!this.autenticacaoService.readToken(r.AccessToken)) {
          this.mensagemService.showErrorViaToast(["Ops! Tivemos um problema!"]);
          this.button.disabled = false;
          this.carregando = false;
          return;
        }

        if (this.autenticacaoService._lojasUsuarioLogado.length > 1) {
          this.mostrarLoja = true;
          this.montarSelectLoja();
          this.autenticacaoService.setarToken(r.AccessToken);
          this.autenticou = true;
          this.mensagemService.showSuccessViaToast("Precisamos que selecione uma loja!");
          this.button.disabled = false;
          this.carregando = false;
          return;
        }

        this.autenticacaoService.setarToken(r.AccessToken);
        this.carregando = false;

        this.autenticacaoService.buscarEstilo(this.autenticacaoService._lojaLogado);
        this.router.navigate(['orcamentos/listar/orcamentos']);
      }
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
