import { Injectable } from '@angular/core';
import { AlertDialogComponent } from './alert-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  env: environment;

  constructor(public dialogService: DialogService,
    private readonly router: Router,
    private envir: environment,
    private readonly sweetalertService: SweetalertService) { 
      this.env = envir;
    }


  public mostrarMensagemComLargura(msg: string, largura: string, aposOk: () => void): void {
    const dialogRef = this.dialogService.open(AlertDialogComponent, {
      width: largura,
      data: msg,
      styleClass: 'dynamicDialog'
    });

  }

  public mostrarMensagem(msg: string): void {
    this.mostrarMensagemComLargura(
      msg, "350px", null);
  }

  public mostrarMensagemBrowser(): void {
    let msg: string = "Este navegador não é suportado!\nPor favor, utilize o Google Chrome, FireFox ou Edge!";
    this.mostrarMensagemComLargura(msg, "350px", null);
  }

  public static mostrandoErroNaoAutorizado: boolean = false;

  public mostrarErroInternet(r: any): void {

    if (r != null) {
      let error: HttpErrorResponse = r;
      if (error.status == 403 || error.status == 401) {
        //colocamos um id no botão para poder simular o click
        let sair = document.getElementById('btnSair');

        if (AlertaService.mostrandoErroNaoAutorizado) {
          sair.click();
          return;
        }

        AlertaService.mostrandoErroNaoAutorizado = true;
        let dialogRef = this.dialogService.open(AlertDialogComponent, {
          width: "250px",
          data: "Erro: Acesso não autorizado!",
          styleClass: "dynamicDialog"
        });

        dialogRef.onClose.subscribe(x => {
          this.router.navigate(["account/login"]);
        })

        // this.mostrarMensagemComLargura("Erro: Acesso não autorizado!", "250px", () => {
        //   AlertaService.mostrandoErroNaoAutorizado = false;

        //   sair.click();
        // });

        return;
      }

      if (error.status == 0) {
        this.mostrarMensagemComLargura(
          "Favor verificar sua conexão com a internet!",
          "250px", null);

        return;
      }

      if (error.status == 422) {
        if(error.error?.Message){
            this.mostrarMensagemComLargura(
                error.error.Message,
                "250px", null);
        }else{
            this.mostrarMensagemComLargura(
                "Erro inesperado! Favor entrar em contato com o suporte técnico.",
                "250px", null);
        }

        return;
      }
      if (error.status == 500) {
        //erro 500
        this.mostrarMensagemComLargura(
            "Erro inesperado! Favor entrar em contato com o suporte técnico.",
            "250px", null);

        return;
      }

      if (this.mostrarErro412(error))
        return;

      if (error.status == 400) {
        let mensagens: Array<string> = new Array();
        let erro = error.error.message;
          mensagens.push(erro);
        // for (let key in error.error.errors) {
        //   // let listaErros = error.error.errors[key];
        //   // for (let erro in listaErros) {
        //   //   mensagens.push(listaErros[erro]);
        //   // }
        // }
        this.mostrarMensagemComLargura("Erro ao salvar.<br>" + mensagens.join("<br>"), "250px", null);
        return
      }

      this.mostrarMensagemComLargura(
        "Erro inesperado! Favor entrar em contato com o suporte técnico (Código: " + error.status + ").",
        "250px", null);

      return;
    }
    else {

      this.mostrarMensagemComLargura(
        "Erro inesperado! Favor entrar em contato com o suporte técnico (null).",
        "250px", null);
      return;
    }
  }


  public mostrarErro412(error: HttpErrorResponse): boolean {

    if (error.status == 412) {
      
      let versao = this.env.versaoApi();

      if (versao == null) {
        versao = "";
      }
      if (versao.trim() != "") {
        versao = " (" + versao + ")";
      }
      this.sweetalertService.dialogoVersao("", "Uma nova versão do sistema está disponível" + versao + ". Clique em OK para carregar a nova versão.").subscribe(result => {        
        
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('lojas');
        sessionStorage.removeItem('lojaLogada');
        localStorage.setItem('versaoApi', this.env.versaoApi());

        window.location.reload();

      });
      return true;
    }
    return false;
  }  

  public mostrarErroAtualizandoVersao(): boolean {
          
      let versao = this.env.versaoApi();

      if (versao == null) {
        versao = "";
      }
      if (versao.trim() != "") {
        versao = " (" + versao + ")";
      }
      this.sweetalertService.dialogoVersao("", "Uma nova versão do sistema está disponível" + versao + ". Clique em OK para carregar a nova versão.").subscribe(result => {                
        localStorage.setItem('versaoApi', this.env.versaoApi());
        window.location.reload();

      });
      return true;
    
    
  }  
}

