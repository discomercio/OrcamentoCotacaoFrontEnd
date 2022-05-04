import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { MensageriaService } from 'src/app/service/mensageria/mensageria.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';

@Component({
  selector: 'app-mensageria',
  templateUrl: './mensageria.component.html',
  styleUrls: ['./mensageria.component.scss']
})
export class MensageriaComponent implements OnInit {

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

  listaMensagens: MensageriaDto[];

  constructor(
    public readonly mensageriaService: MensageriaService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
  ) { }

  @ViewChild("mensagem") mensagem: ElementRef;

  ngOnInit(): void {
    this.obterListaMensagem(this.idOrcamentoCotacao);
  }

  obterListaMensagem(idOrcamentoCotacao: number) {

    this.mensageriaService.obterListaMensagem(idOrcamentoCotacao.toString()).toPromise().then((r) => {
      if (r != null) {
        this.listaMensagens = r;
        console.log(this.listaMensagens);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  enviarMensagem() {

    let msg = new MensageriaDto();
    msg.IdOrcamentoCotacao = this.idOrcamentoCotacao.toString();
    msg.Mensagem = this.mensagem.nativeElement.value;
    msg.IdTipoUsuarioContextoRemetente = this.idTipoUsuarioContextoRemetente;
    msg.IdTipoUsuarioContextoDestinatario = this.idTipoUsuarioContextoDestinatario;
    msg.IdUsuarioRemetente = this.idUsuarioRemetente;
    msg.IdUsuarioDestinatario = this.idUsuarioDestinatario;

    this.mensageriaService.enviarMensagem(msg).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
        this.obterListaMensagem(this.idOrcamentoCotacao);
        this.mensagem.nativeElement.value = '';
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
