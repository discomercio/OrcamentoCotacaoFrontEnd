import { Injectable } from '@angular/core';
import { AlertDialogComponent } from './alert-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  constructor(public dialogService: DialogService,
    private readonly router: Router,
    private readonly sweetalertService: SweetalertService,
    private appSettingsService: AppSettingsService) { 

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
        if (error.error.Mensagem != undefined) {
          this.mostrarMensagemComLargura(error.error.Mensagem, "250px", null);
        }
        else
        {
          this.mostrarMensagemComLargura(
              "Erro inesperado! Favor entrar em contato com o suporte técnico.",
              "250px", null);
         }
        return;
      }

      if (this.mostrarErro412(error))
        return;

      if (error.status == 400) {
        let mensagens: Array<string> = new Array();
        let erro = error.error.message;
        mensagens.push(erro);

        if (error.error.Mensagem != undefined) {
          this.mostrarMensagemComLargura(error.error.Mensagem, "250px", null);
        }
        else {
          this.mostrarMensagemComLargura("Erro ao salvar.<br>" + mensagens.join("<br>"), "250px", null);
        }
        
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

      this.sweetalertService.dialogoVersao("", "Erro [412 - Versão]  -  Favor entrar em contato com o suporte técnico.").subscribe(result => {        
        
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('lojas');
        sessionStorage.removeItem('lojaLogada');
        localStorage.removeItem("appsettings");
        localStorage.removeItem("versaoApi");

        window.location.reload();

      });

      return true;
    }

    return false;
  } 

  public mostrarErroAtualizandoVersao(): boolean {
          
    let versao = this.appSettingsService.versao;

    if (versao == null) {
      versao = "";
    }
    if (versao.trim() != "") {
      versao = " (" + versao + ")";
    }

    this.sweetalertService.dialogoVersao("", "Uma nova versão do sistema está disponível" + versao + ". Clique em OK para carregar a nova versão.").subscribe(result => {                

        localStorage.removeItem("appsettings");
        localStorage.removeItem("versaoApi");

        window.location.reload();
    });
    
    return true;
  }  
}