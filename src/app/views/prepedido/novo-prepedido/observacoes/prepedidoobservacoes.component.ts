import { Component, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import { PassoPrepedidoBase } from '../passo-prepedido-base';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { MatDialog } from '@angular/material';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';


@Component({
  selector: 'app-prepedidoobservacoes',
  templateUrl: './prepedidoobservacoes.component.html',
  styleUrls: ['./prepedidoobservacoes.component.scss', '../../../../estilos/endereco.scss']
})
export class PrePedidoObservacoesComponent extends PassoPrepedidoBase implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    router: Router,
    novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly alertaService: AlertaService,
    public readonly dialog: MatDialog,
    telaDesktopService: TelaDesktopService,
    public readonly prepedidoBuscarService: PrepedidoBuscarService,
    private _ngZone: NgZone,
    private readonly sweetAlertService: SweetalertService
  ) {
    super(telaDesktopService, router, novoPrepedidoDadosService);
  }

  @ViewChild('autosize', { static: true }) autosize: CdkTextareaAutosize;
  constantes = new Constantes();
  EntregaImediata: boolean;
  BemDeUso_Consumo: boolean;
  InstaladorInstala: boolean;
  PrevisaoEntrega: string = "";
  contador: number = 0;
  carregando: boolean;

  ngOnInit() {
    this.verificarEmProcesso();
    this.dadosDoModelo();
    this.verificarValidacaoEmailBoleto();
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  //#region navegação
  voltar() {
    this.dadosParaModelo();
    this.location.back();
  }

  continuar() {

    debugger;

    this.carregando = true;
    if (!this.dadosParaModelo()) {
      this.carregando = false;
      return false;
    }
    if (!this.novoPrepedidoDadosService.prePedidoDto.EnderecoEntrega.OutroEndereco) {
      this.novoPrepedidoDadosService.prePedidoDto.EnderecoEntrega = new EnderecoEntregaDtoClienteCadastro();
      this.novoPrepedidoDadosService.prePedidoDto.EnderecoEntrega.OutroEndereco = false;
    }

    this.prepedidoBuscarService.cadastrarPrepedido(this.novoPrepedidoDadosService.prePedidoDto).subscribe({
      next: (r) => {

        if (r == null) {
          r = new Array();
          r.push("Retorno nulo do servidor.");
        }
        if (r.length > 0) {
          //se tiver 1 item e nenhum espaço, é o numero do prepedido criado
          if (r[0].length > 9 || r.length != 1 || r[0].indexOf(" ") >= 0) {
            this.alertaService.mostrarMensagem("Erros ao salvar. \nLista de erros: \n" + r.join("\n"));
            this.carregando = false;
            return;
          }
          else {
            this.carregando = false;
            this.sweetAlertService.sucesso("Pedido criado com sucesso.");
            localStorage.setItem('ultima_url', document.URL);
            this.router.navigate(["prepedido/detalhes/" + r[0]]);
          }
        }

      },
      error: (r) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
      }
    });
  }

  verificarValidacaoEmailBoleto(){
    debugger;
    this.prePedidoDto.EnderecoCadastroClientePrepedido.Endereco_email_boleto
    
    if(this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento == Number.parseInt(this.constantes.COD_FORMA_PAGTO_A_VISTA)){
      if(this.novoPrepedidoDadosService.idMeioPagtoMonitorado.indexOf(`|${this.prePedidoDto.FormaPagtoCriacao.Op_av_forma_pagto}|`) > -1 || 
      this.novoPrepedidoDadosService.idMeioPagtoMonitorado.indexOf(`|${this.prePedidoDto.FormaPagtoCriacao.Op_av_forma_pagto}|`) > -1){
        this.novoPrepedidoDadosService.validaEmailBoleto = true;
      }
    }
    if(this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento == Number.parseInt(this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA)){
      if(this.novoPrepedidoDadosService.idMeioPagtoMonitorado.indexOf(`|${this.prePedidoDto.FormaPagtoCriacao.Op_pce_entrada_forma_pagto}|`) > -1 || 
      this.novoPrepedidoDadosService.idMeioPagtoMonitorado.indexOf(`|${this.prePedidoDto.FormaPagtoCriacao.Op_pce_prestacao_forma_pagto}|`) > -1){
        this.novoPrepedidoDadosService.validaEmailBoleto = true;
      }
    }
    if(this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento == Number.parseInt(this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA)){
      if(this.novoPrepedidoDadosService.idMeioPagtoMonitorado.indexOf(`|${this.prePedidoDto.FormaPagtoCriacao.Op_pu_forma_pagto}|`) > -1){
        this.novoPrepedidoDadosService.validaEmailBoleto = true;
      }
    }
  }

  dadosDoModelo() {

    if (this.prePedidoDto.DetalhesPrepedido.EntregaImediata != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.EntregaImediata == undefined) {
      this.EntregaImediata = true;
    }
    if (this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo == undefined) {
      this.BemDeUso_Consumo = true;
    }
    if (this.prePedidoDto.DetalhesPrepedido.InstaladorInstala != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.InstaladorInstala == undefined) {
      this.InstaladorInstala = true;
    }
  }

  dadosParaModelo() {
    if (!this.verificaEntregaImediata())
      return false;

    this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo = this.constantes.COD_ST_BEM_USO_CONSUMO_NAO.toString();
    if (this.BemDeUso_Consumo) {
      this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo = this.constantes.COD_ST_BEM_USO_CONSUMO_SIM.toString();
    }

    this.prePedidoDto.DetalhesPrepedido.InstaladorInstala = this.constantes.COD_INSTALADOR_INSTALA_NAO.toString();
    if (this.InstaladorInstala) {
      this.prePedidoDto.DetalhesPrepedido.InstaladorInstala = this.constantes.COD_INSTALADOR_INSTALA_SIM.toString();
    }

    return true;
  }

  contarCaracter(): void {
    this.contador = this.prePedidoDto.DetalhesPrepedido.Observacoes.length;
  }

  verificaEntregaImediata(): boolean {
    let retorno: boolean = true;

    if (this.EntregaImediata) {
      this.PrevisaoEntrega = "";
    }
    this.prePedidoDto.DetalhesPrepedido.EntregaImediata = this.constantes.COD_ETG_IMEDIATA_SIM.toString();
    if (!this.EntregaImediata) {
      this.prePedidoDto.DetalhesPrepedido.EntregaImediata = this.constantes.COD_ETG_IMEDIATA_NAO.toString();
      //vamos validar a data de entrega imediata 

      if (!!this.PrevisaoEntrega) {
        if (DataUtils.formata_formulario_date(this.PrevisaoEntrega) <= new Date()) {
          this.PrevisaoEntrega = "";
          this.alertaService.mostrarMensagem("A data para entrega deve ser posterior a data atual!");

          retorno = false;
        }
        else {
          this.prePedidoDto.DetalhesPrepedido.EntregaImediataData = this.PrevisaoEntrega;
        }
      }
      else {
        this.alertaService.mostrarMensagem("Favor informar a data para entrega.");
        retorno = false;
      }
    }
    return retorno;
  }
}
