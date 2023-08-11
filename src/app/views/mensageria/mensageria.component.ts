import { Component, AfterContentInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { MensageriaService } from 'src/app/service/mensageria/mensageria.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-mensageria',
  templateUrl: './mensageria.component.html',
  styleUrls: ['./mensageria.component.scss']
})
export class MensageriaComponent {
''
  @Input('idOrcamentoCotacao')
  public idOrcamentoCotacao: number;

  @Input('idUsuarioRemetente')
  public idUsuarioRemetente: string;

  @Input('idUsuarioDestinatario')
  public idUsuarioDestinatario: string;

  @Input('idTipoUsuarioContextoRemetente')
  public idTipoUsuarioContextoRemetente: string;

  @Input('idTipoUsuarioContextoDestinatario')
  public idTipoUsuarioContextoDestinatario: string;

  @Input('donoOrcamento')
  public donoOrcamento: boolean;

  @Input('permiteEnviarMensagem')
  public permiteEnviarMensagem: boolean;

  @Input('rotaPublica')
  public rotaPublica: boolean;

  @Input('guid')
  public guid: string;

  @ViewChild('sc', { static: true }) sc: ScrollPanel;

  listaMensagens: MensageriaDto[];

  public carregando: boolean;

  constructor(
    public readonly mensageriaService: MensageriaService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
  ) { }

  @ViewChild("mensagem") mensagem: ElementRef;

  obterListaMensagem(idOrcamentoCotacao: number) {
    this.carregando = true;
    const promise = [this.buscarListaMensagem(idOrcamentoCotacao), this.marcarMensagemComoLida(idOrcamentoCotacao)];
    Promise.all(promise).then((r) => {
      this.setarListaMensagem(idOrcamentoCotacao, r[0]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
      //dento do settimeout, por algum motivo não reflete no layout
      //sendo assim, não rola o scroll das mensagens para baixo
      setTimeout(() => {
        this.rolarChat();
      }, 300);
      return;
    })
  }

  buscarListaMensagem(idOrcamentoCotacao: number): Promise<MensageriaDto[]> {
    if (this.rotaPublica && this.guid) {
      return this.mensageriaService.obterListaMensagemRotaPublica(this.guid).toPromise();
    }

    return this.mensageriaService.obterListaMensagem(idOrcamentoCotacao.toString()).toPromise();
  }

  setarListaMensagem(idOrcamento: number, r: Array<MensageriaDto>) {
    if (r != null) {
      this.listaMensagens = r.sort((a, b) => {
        return Number.parseInt(a.Id) - Number.parseFloat(b.Id);
      });
    }
  }

  enviarMensagem() {
    this.validar();
    this.carregando = true;

    let msg = new MensageriaDto();
    msg.IdOrcamentoCotacao = this.idOrcamentoCotacao.toString();
    msg.Mensagem = this.mensagem.nativeElement.value;
    msg.IdTipoUsuarioContextoRemetente = this.idTipoUsuarioContextoRemetente;
    msg.IdTipoUsuarioContextoDestinatario = this.idTipoUsuarioContextoDestinatario;
    msg.IdUsuarioRemetente = this.idUsuarioRemetente;
    msg.IdUsuarioDestinatario = this.idUsuarioDestinatario;
    if (this.rotaPublica && this.guid) {

      this.mensageriaService.enviarMensagemRotaPublica(msg, this.guid).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
          this.mensagem.nativeElement.value = '';
        }
      }).catch((r) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
      }).finally(()=>{
        this.carregando = false;
        this.obterListaMensagem(this.idOrcamentoCotacao);
      });
    } else {
      this.mensageriaService.enviarMensagem(msg).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
          this.mensagem.nativeElement.value = '';
        }
      }).catch((r) => {
        this.alertaService.mostrarErroInternet(r);
        this.carregando = false;
      }).finally(()=>{
        this.carregando = false;
        this.obterListaMensagem(this.idOrcamentoCotacao);
      });
    }
  }

  marcarPendenciaTratada() {
    this.carregando = true;
    this.mensageriaService.obterListaMensagem(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {

      if (r != null && r.length > 0) {
        if (r[0]['PendenciaTratada'] == true) {
          this.mensageriaService.desmarcarPendenciaTratada(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {
            if (r != null) {
              this.mensagemService.showSuccessViaToast("Mensagens marcadas como não tratadas!");
            }
            this.carregando = false;
          }).catch((r) => {
            this.alertaService.mostrarErroInternet(r);
            this.carregando = false;
          });
        } else {
          this.mensageriaService.marcarPendenciaTratada(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {
            if (r != null) {
              this.mensagemService.showSuccessViaToast("Mensagens marcadas como tratadas!");
            }
            this.carregando = false;
          }).catch((r) => {
            this.alertaService.mostrarErroInternet(r);
            this.carregando = false;
          });
        }
      } else {
        this.mensagemService.showWarnViaToast("Não há mensagens para marcar como tratadas!");
        this.carregando = false;
      }
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
  }

  marcarMensagemComoLida(idOrcamentoCotacao: number): Promise<any> {
    var url = window.location.href;
    var acessoExterno = url.includes("publico/orcamento");

    if (acessoExterno) {
      return this.mensageriaService.marcarMensagemComoLidaRotaPublica(this.guid).toPromise();
    }

    return this.mensageriaService.marcarMensagemComoLida(idOrcamentoCotacao.toString()).toPromise();
  }

  validar() {
    if (this.mensagem.nativeElement.value == "") {
      throw this.mensagemService.showWarnViaToast("Ops...você não informou nenhuma mensagem!");
    }
  }

  formatarData(dateString) {
    if ('undefined' === typeof dateString || '' === dateString) {
      return null;
    }
    var parts = dateString.split('-');
    var hora = dateString.substr(11, 5);

    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);

    var dataFinal = day + "/" + month + "/" + year + " " + hora;

    return dataFinal;
  }

  rolarChat() {
    let widgetchat = document.getElementById("chat") as HTMLElement;
    this.sc.scrollTop(widgetchat.clientHeight);
  }
}
