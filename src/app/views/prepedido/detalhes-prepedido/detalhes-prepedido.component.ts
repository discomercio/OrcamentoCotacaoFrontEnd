import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';


@Component({
  selector: 'app-detalhes-prepedido',
  templateUrl: './detalhes-prepedido.component.html',
  styleUrls: ['./detalhes-prepedido.component.scss']
})
export class DetalhesPrepedidoComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly prepedidoService: PrepedidoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private location: Location
  ) { }

  numeroPrepedido = "";
  prepedido: any = null;

  carregar() {
    if (this.numeroPrepedido) {
      this.prepedidoService.carregar(this.numeroPrepedido).toPromise().then((r) => {
        if (r != null) {
          this.prepedido = r;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  voltar() {
    this.location.back();
  } 

  ngOnInit() {
    this.numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;
    this.carregar();
  }

}
