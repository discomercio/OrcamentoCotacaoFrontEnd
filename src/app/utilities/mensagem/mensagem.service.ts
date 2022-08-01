import { Component, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})

export class MensagemService {

  constructor(private messageService: MessageService) { }

  showInfoViaToast(mensagem: string) {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: mensagem });
  }

  showWarnViaToast(mensagem: string) {
    this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Atenção', detail: mensagem });
  }

  showErrorViaToast(mensagens: Array<string>) {
    let mensagem:string;
    for (let key in mensagens) {
      let listaErros = mensagens
      for (let erro in listaErros) {
        mensagem = listaErros[erro];
      }
    }
    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Erro', detail: mensagem });
  }


  showSuccessViaToast(mensagem: string) {
    ;
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Sucesso', detail: mensagem });
  }
}
