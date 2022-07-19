import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PedidoService } from 'src/app/service/pedido/pedido.service';


@Component({
  selector: 'app-pedido-detalhes',
  templateUrl: './pedido-detalhes.component.html',
  styleUrls: ['./pedido-detalhes.component.scss']
})
export class PedidoDetalhesComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly pedidoService: PedidoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private location: Location
  ) { }
  
  numeroPedido = "";
  pedido: any = null;

  carregar() {    
    if (this.numeroPedido) {
      this.pedidoService.carregar(this.numeroPedido).toPromise().then((r) => {
        if (r != null) {
          this.pedido = r;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  voltar() {
    this.location.back();
  } 

  editar() {
    //
  } 

  ngOnInit() {
    this.numeroPedido = this.activatedRoute.snapshot.params.numeroPedido;
    this.carregar();
  }

}
