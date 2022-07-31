import { Component, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import { PassoPrepedidoBase } from '../passo-prepedido-base';
import { TelaDesktopService } from 'src/app/servicos/telaDesktop/telaDesktop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { AlertaService } from 'src/app/utils/alert-dialog/alerta.service';
import { MatDialog } from '@angular/material';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { Constantes } from 'src/app/dto/Constantes';
import { PrepedidoBuscarService } from 'src/app/servicos/prepedido/prepedido-buscar.service';
import { DataUtils } from 'src/app/utils/dataUtils';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';


@Component({
  selector: 'app-observacoes',
  templateUrl: './observacoes.component.html',
  styleUrls: ['./observacoes.component.scss', '../../../estilos/endereco.scss']
})
export class ObservacoesComponent extends PassoPrepedidoBase implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    router: Router,
    novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly alertaService: AlertaService,
    public readonly dialog: MatDialog,
    telaDesktopService: TelaDesktopService,
    public readonly prepedidoBuscarService: PrepedidoBuscarService,
    private _ngZone: NgZone
  ) {
    super(telaDesktopService, router, novoPrepedidoDadosService);
  }

  ngOnInit() {
    this.verificarEmProcesso();
    this.dadosDoModelo();
  }

  @ViewChild('autosize', { static: true }) autosize: CdkTextareaAutosize;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public etg_imediata: boolean = false;


  //#region navegação
  voltar() {
    this.dadosParaModelo();
    this.location.back();
  }
  salvando: boolean;
  continuar() {
    this.salvando = true;
    if (!this.dadosParaModelo()) {
      this.salvando = false;
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
            this.salvando = false;
            return;
          }
          else {
            this.salvando = false;
            this.alertaService.mostrarMensagem("Pedido criado com sucesso.");
            localStorage.setItem('ultima_url', document.URL);
            this.router.navigate(["prepedido/detalhes/" + r[0]]);
          }
        }

      },
      error: (r) => { this.alertaService.mostrarErroInternet(r); this.salvando = false; }
    });
    // this.dadosParaModelo();

    // this.router.navigate(["../confirmar-prepedido"], { relativeTo: this.activatedRoute });
  }
  //#endregion


  constantes = new Constantes();

  //para converter da estrutura de dados para os controles do slider da tela
  public EntregaImediata: boolean;
  public BemDeUso_Consumo: boolean;
  public InstaladorInstala: boolean;
  // public GarantiaIndicador: boolean;
  dadosDoModelo() {

    if (this.prePedidoDto.DetalhesPrepedido.EntregaImediata != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.EntregaImediata == undefined) {
      this.EntregaImediata = true;
    }
    // this.BemDeUso_Consumo = false;
    if (this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.BemDeUso_Consumo == undefined) {
      this.BemDeUso_Consumo = true;
    }
    // this.InstaladorInstala = false;
    if (this.prePedidoDto.DetalhesPrepedido.InstaladorInstala != "NÃO" ||
      this.prePedidoDto.DetalhesPrepedido.InstaladorInstala == undefined) {
      this.InstaladorInstala = true;
    }
  }

  public PrevisaoEntrega: string = "";
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

    // this.prePedidoDto.DetalhesPrepedido.GarantiaIndicador = this.constantes.COD_GARANTIA_INDICADOR_STATUS__NAO.toString();
    // if (this.GarantiaIndicador) {
    //   this.prePedidoDto.DetalhesPrepedido.GarantiaIndicador = this.constantes.COD_GARANTIA_INDICADOR_STATUS__SIM.toString();
    // }
    return true;
  }
  public contador: number = 0;
  public contarCaracter(): void {
    this.contador = this.prePedidoDto.DetalhesPrepedido.Observacoes.length;
  }

  required: boolean;
  public verificaEntregaImediata(): boolean {
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
