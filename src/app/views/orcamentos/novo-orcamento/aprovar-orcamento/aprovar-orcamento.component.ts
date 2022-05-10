
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, VERSION, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { OrcamentosService } from 'src/app/views/orcamentos/orcamentos.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { MensageriaService } from 'src/app/service/mensageria/mensageria.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';


@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly mensagemService: MensagemService,
    private readonly orcamentoCotacaoMensagemService: MensageriaService,
    private fb: FormBuilder,
    private location: Location) {
    super(telaDesktopService);
  }
  public form: FormGroup;
  listaMensagens: MensageriaDto[];
  dataUtils: DataUtils = new DataUtils();

  vendedor: boolean;
  tipoUsuario: string;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  public mascaraTelefone: string;
  formataTelefone = new FormataTelefone(); 
  
  @ViewChild("mensagem") mensagem: ElementRef;

  idOrcamentoCotacao:number;
  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
    console.log(this.idOrcamentoCotacao);
    // FIXO - Pois no momento que foi constrúido a mensageria, as informações carregadas na tela eram mocking. 
    this.vendedor = true;
    // this.idOrcamentoCotacao = "2";

    if (this.vendedor) {
      this.idUsuarioRemetente = "50197";
      this.idUsuarioDestinatario = "50025";
    } else {
      this.idUsuarioRemetente = "50025";
      this.idUsuarioDestinatario = "50197";
    }

    this.orcamentoCotacaoMensagemService.marcarComoLida(this.idOrcamentoCotacao.toString(), this.idUsuarioRemetente);

    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
      console.log(this.desabiltarBotoes);
    });
    this.buscarOrcamento(this.idOrcamentoCotacao);
    this.obterListaMensagem(2);

  }

  @Input() desabiltarBotoes: boolean;

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;

  buscarOrcamento(id: number) {
    this.novoOrcamentoService.criarNovo();
    this.orcamentoService.buscarOrcamento(id).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto = r;
      }
    });
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

  obterListaMensagem(idOrcamentoCotacao: number) {

    this.orcamentoCotacaoMensagemService.obterListaMensagem(idOrcamentoCotacao.toString()).toPromise().then((r) => {
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
    msg.IdTipoUsuarioContextoRemetente = "1";
    msg.IdTipoUsuarioContextoDestinatario = "1";
    msg.IdUsuarioRemetente = this.idUsuarioRemetente;
    msg.IdUsuarioDestinatario = this.idUsuarioDestinatario;

    this.orcamentoCotacaoMensagemService.enviarMensagem(msg).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
        this.obterListaMensagem(2);
        this.mensagem.nativeElement.value = '';
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  activeState: boolean[] = [false, false, false];
  toggle(index: number) {
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  aprovar(orcamento) {
    if (!this.opcaoPagto) {
    }
    this.sweetalertService.confirmarAprovacao("Deseja aprovar essa opção?", "").subscribe(result => {
      console.log(result);

    });
  }

  voltar(){
      this.location.back();
  }

}
