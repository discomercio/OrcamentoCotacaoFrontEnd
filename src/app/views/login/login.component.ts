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
  
  @ViewChild(InputArClubeComponent, {static: false})
  input: InputArClubeComponent

  @ViewChild(DropdownArClubeComponent, {static: false})
  dropdown: DropdownArClubeComponent

  @ViewChild(ButtonArClubeComponent, {static: false})
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

  login() {
    if (!this.usuario || !this.senha) {
      //this.toast.showToast(eToast.error,"É necessário prencher usuário e senha!")
       this.mensagemService.showErrorViaToast(["É necessário prencher usuário e senha!"]);
      return;
    }

    if (!this.loja && this.mostrarLoja) {
      // this.toast.showToast(eToast.warning,"Precisamos que selecione uma loja!")
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

    this.autenticacaoService.authLogin2(this.usuario, this.senha).toPromise().then((r) => {
      if (r != null) {
        if (!this.autenticacaoService.readToken(r.AccessToken)) {
          //this.toast.showToast(eToast.error,"Ops! Tivemos um problema!")
          this.mensagemService.showErrorViaToast(["Ops! Tivemos um problema!"]);
          return;
        }

        if (this.autenticacaoService._lojasUsuarioLogado.length > 1) {
          this.mostrarLoja = true;
          this.montarSelectLoja();
          this.autenticacaoService.setarToken(r.AccessToken);
          this.autenticou = true;
          //this.toast.showToast(eToast.success,"Precisamos que selecione uma loja!")
          this.mensagemService.showSuccessViaToast("Precisamos que selecione uma loja!");
          return;
        }

        this.autenticacaoService.setarToken(r.AccessToken);
        // sessionStorage.setItem("lojaLogada", this.loja);
        // sessionStorage.setItem("lojas", this.autenticacaoService._lojasUsuarioLogado.toString());
        this.router.navigate(['orcamentos/listar/orcamentos']);
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
      console.log(item);
    });
  }
  desligarFazendoLoginFOrmulario(): void {
    // this.fazendoLogin = false;
  }

}
