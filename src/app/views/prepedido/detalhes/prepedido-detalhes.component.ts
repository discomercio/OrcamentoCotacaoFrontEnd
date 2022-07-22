import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';


@Component({
  selector: 'app-prepedido-detalhes',
  templateUrl: './prepedido-detalhes.component.html',
  styleUrls: ['./prepedido-detalhes.component.scss']
})
export class PrepedidoDetalhesComponent implements OnInit {
  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly prepedidoService: PrepedidoService,
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
