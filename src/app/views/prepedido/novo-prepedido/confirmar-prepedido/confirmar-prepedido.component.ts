import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { PassoPrepedidoBase } from '../passo-prepedido-base';
import { ThrowStmt } from '@angular/compiler';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';

@Component({
  selector: 'app-confirmar-prepedido',
  templateUrl: './confirmar-prepedido.component.html',
  styleUrls: ['./confirmar-prepedido.component.scss']
})
export class ConfirmarPrepedidoComponent extends PassoPrepedidoBase implements OnInit {


  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    router: Router,
    public novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly alertaService: AlertaService,
    public readonly dialog: MatDialog,
    telaDesktopService: TelaDesktopService,
    public readonly prepedidoBuscarService: PrepedidoBuscarService
  ) {
    super(telaDesktopService, router, novoPrepedidoDadosService);
  }

  ngOnInit() {
    this.verificarEmProcesso();
  }

  //#region navegação
  voltar() {
    this.location.back();
  }
  continuar() {
    

    this.prepedidoBuscarService.cadastrarPrepedido(this.novoPrepedidoDadosService.prePedidoDto).subscribe({
      next: (r) => {

        if (r == null) {

          r = new Array();
          r.push("Retorno nulo do servidor.");
        }
        if (r.length > 0) {
          this.alertaService.mostrarMensagem("Erros ao salvar. \nLista de erros: \n" + r.join("\n"));
          return;
        }
        this.alertaService.mostrarMensagem("Pedido criado com sucesso.");
        this.router.navigate(["/"]);
      },
      error: (r) => this.alertaService.mostrarErroInternet(r)
    });
  }
  //#endregion


}
