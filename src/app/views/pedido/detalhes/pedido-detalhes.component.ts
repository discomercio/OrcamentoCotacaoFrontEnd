import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PedidoService } from 'src/app/service/pedido/pedido.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';


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
  stringUtils = new StringUtils();  
  moedaUtils: MoedaUtils = new MoedaUtils();  
  dataUtils: DataUtils = new DataUtils();  
  formatarTelefone: FormataTelefone = new FormataTelefone();

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
  
  //para dizer se é PF ou PJ
  ehPf(): boolean {
    if (this.pedido && this.pedido.DadosCliente && this.pedido.DadosCliente.Tipo)
      return this.pedido.DadosCliente.Tipo == 'PF';
    //sem dados! qualquer opção serve...  
    return true;
  }     

  somenteDigito(msg: string): string {
    return msg.replace(/\D/g, "");
  }
  
  //status da entrega imediata
  entregaImediata(): string {
    if (!this.pedido || !this.pedido.DetalhesNF)
      return "";

    return this.pedido.DetalhesNF.EntregaImediata;
  }  

  ngOnInit() {
    this.numeroPedido = this.activatedRoute.snapshot.params.numeroPedido;
    this.carregar();
  }

}
