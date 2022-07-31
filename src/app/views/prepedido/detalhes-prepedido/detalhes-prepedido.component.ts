import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { PedidoBuscarService } from 'src/app/service/pedido/pedido-buscar.service';


@Component({
  selector: 'app-detalhes-prepedido',
  templateUrl: './detalhes-prepedido.component.html',
  styleUrls: ['./detalhes-prepedido.component.scss']
})
export class DetalhesPrepedidoComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly prepedidoBuscarService: PrepedidoBuscarService,
    public readonly pedidoBuscarService: PedidoBuscarService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private location: Location
  ) { }

  numeroPrepedido = "";
  prepedido: any = null;
  stringUtils = new StringUtils();  
  moedaUtils: MoedaUtils = new MoedaUtils();  
  dataUtils: DataUtils = new DataUtils();  
  formatarTelefone: FormataTelefone = new FormataTelefone();

  carregar() {
    if (this.numeroPrepedido) {
      this.prepedidoBuscarService.buscar(this.numeroPrepedido).toPromise().then((r) => {
        if (r != null) {
          this.prepedido = r;
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
    if (this.prepedido && this.prepedido.DadosCliente && this.prepedido.DadosCliente.Tipo)
      return this.prepedido.DadosCliente.Tipo == 'PF';
    //sem dados! qualquer opção serve...  
    return true;
  }
  
  verificaValor() {
    if (this.prepedido.TotalFamiliaParcelaRA >= 0)
      return true
    else
      return false;
  }  

  ngOnInit() {
    this.numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;
    this.carregar();
  }

}
