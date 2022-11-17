import { Component, AfterContentInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { MensageriaService } from 'src/app/service/mensageria/mensageria.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';

@Component({
  selector: 'app-mensageria',
  templateUrl: './mensageria.component.html',
  styleUrls: ['./mensageria.component.scss']
})
export class MensageriaComponent implements AfterViewInit {

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

  listaMensagens: MensageriaDto[];

  constructor(
    public readonly mensageriaService: MensageriaService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
  ) { }

  @ViewChild("mensagem") mensagem: ElementRef;

  ngAfterViewInit(): void {
    this.obterListaMensagem(this.idOrcamentoCotacao);
  }

  obterListaMensagem(idOrcamentoCotacao: number) {

    //Rota Pública
    if (this.rotaPublica && this.guid) {

      this.mensageriaService.obterListaMensagemRotaPublica(this.guid).toPromise().then((r) => {
        if (r != null) {
          this.listaMensagens = r;

          this.marcarMensagemComoLida(idOrcamentoCotacao);
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));

    } else {

      //Interno
      if (idOrcamentoCotacao) {
        this.mensageriaService.obterListaMensagem(idOrcamentoCotacao.toString()).toPromise().then((r) => {
          if (r != null) {
            this.listaMensagens = r;

            this.marcarMensagemComoLida(idOrcamentoCotacao);
          }
        }).catch((r) => this.alertaService.mostrarErroInternet(r));
      }

    }
  }

  enviarMensagem() {
    this.validar();

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
          this.obterListaMensagem(this.idOrcamentoCotacao);
          this.mensagem.nativeElement.value = '';
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));

    } else {
      this.mensageriaService.enviarMensagem(msg).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
          this.obterListaMensagem(this.idOrcamentoCotacao);
          this.mensagem.nativeElement.value = '';
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  marcarPendenciaTratada() {

    this.mensageriaService.obterListaMensagem(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {

      if (r != null && r.length > 0) {
        if (r[0]['PendenciaTratada'] == true) {
          this.mensageriaService.desmarcarPendenciaTratada(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {
            if (r != null) {
              this.mensagemService.showSuccessViaToast("Mensagens marcadas como não tratadas!");
            }
          }).catch((r) => this.alertaService.mostrarErroInternet(r));
        } else {
          this.mensageriaService.marcarPendenciaTratada(this.idOrcamentoCotacao.toString()).toPromise().then((r) => {
            if (r != null) {
              this.mensagemService.showSuccessViaToast("Mensagens marcadas como tratadas!");
            }
          }).catch((r) => this.alertaService.mostrarErroInternet(r));
        }
      } else {
        this.mensagemService.showWarnViaToast("Não há mensagens para marcar como tratadas!");
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  marcarMensagemComoLida(idOrcamentoCotacao: number) {

    var url = window.location.href;

    var acessoExterno = url.includes("publico/orcamento");

    if (acessoExterno) {
      this.mensageriaService.marcarMensagemComoLidaRotaPublica(this.guid).toPromise().then((r) => {
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    } else {
      this.mensageriaService.marcarMensagemComoLida(idOrcamentoCotacao.toString()).toPromise().then((r) => {
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }

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

}
