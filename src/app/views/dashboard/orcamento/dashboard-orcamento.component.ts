import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Component, OnInit } from '@angular/core';
import { DownloadsService } from 'src/app/service/downloads/downloads.service';
import { DashboardOrcamentoService } from 'src/app/service/dashboard/orcamento/dashboard-orcamento.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-orcamento',
  templateUrl: './dashboard-orcamento.component.html',
  styleUrls: ['./dashboard-orcamento.component.scss']
})

export class DashboardOrcamentoComponent implements OnInit {
  constructor(private readonly downloadsService: DownloadsService,
    private readonly validacaoFormGroup: ValidacaoFormularioService,
    private readonly dashboardOrcamentoService: DashboardOrcamentoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly sweetalertService: SweetalertService) {

  }

  public qtdOrcamentoSemParceiro: number;
  public qtdOrcamentoComParceiro: number;
  public qtdOrcamentoExpirado: number;
  public qtdOrcamentoAExpirar: number;
  public parceiros: string[] = [];

  ngOnInit(): void {

    // Usuário interno
    if (this.autenticacaoService._tipoUsuario == 1)
    {
      this.dashboardOrcamentoVendedorInterno();      
    }else{
      this.sweetalertService.aviso("Estamos implementando o dashboard para o seu perfil. Aguarde mais alguns dias. :)");
      this.router.navigate(['/']);      
    }
    
  }

  dashboardOrcamentoVendedorInterno() {

    var tresDiasAtras = new Date(); tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
    var tresDiasDepois = new Date(); tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);

    let dataAtual = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));

    let dataTresDiasAtras = DataUtils.formata_dataString_para_formato_data(tresDiasAtras.toLocaleString("pt-br").slice(0, 10));
    let dataTresDiasDepois = DataUtils.formata_dataString_para_formato_data(tresDiasDepois.toLocaleString("pt-br").slice(0, 10));

    this.dashboardOrcamentoService.dashboardOrcamentoParceiro().toPromise().then(response => {
      var indice = 0;
      var qtdOrcamentoSemParceiro = 0;
      var qtdOrcamentoComParceiro = 0;
      var qtdOrcamentoExpirado = 0;
      var qtdOrcamentoAExpirar = 0;

      while (indice < response.length) {

        var dataExpiracaoOrcamento = response[indice].DtExpiracao.toString().slice(0, 10);

        // [Expirados]
        if (dataExpiracaoOrcamento > dataAtual && dataExpiracaoOrcamento <= dataTresDiasDepois) {
          qtdOrcamentoExpirado++;
        }

        // [À expirar]
        if (dataExpiracaoOrcamento < dataAtual && dataExpiracaoOrcamento >= dataTresDiasAtras) {
          qtdOrcamentoAExpirar++;
        }

        // [Sem parceiro]
        if (response[indice].Parceiro == "-") {
          qtdOrcamentoSemParceiro++;
        }

        // [Com parceiro]
        if (response[indice].Parceiro != "-") {
          this.parceiros.push(response[indice].Parceiro);
          qtdOrcamentoComParceiro++;
        }

        indice++;
      }

      this.ordenarParceiros();

      this.qtdOrcamentoSemParceiro = qtdOrcamentoSemParceiro;
      this.qtdOrcamentoComParceiro = qtdOrcamentoComParceiro;
      this.qtdOrcamentoExpirado = qtdOrcamentoExpirado;
      this.qtdOrcamentoAExpirar = qtdOrcamentoAExpirar;

    }).catch((response) => this.sweetalertService.aviso(response));
  }

  ordenarParceiros() {
    let arrayParceiros = this.parceiros,
      result = arrayParceiros.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));

    let sortable = [];
    for (var vehicle in result) {
      sortable.push([vehicle, result[vehicle]]);
    }

    sortable.sort(function (a, b) {
      return a[1] - b[1];
    });

    this.parceiros = sortable;
  }

}