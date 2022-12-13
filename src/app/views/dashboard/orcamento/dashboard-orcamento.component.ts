import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashboardOrcamentoService } from 'src/app/service/dashboard/orcamento/dashboard-orcamento.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-orcamento',
  templateUrl: './dashboard-orcamento.component.html',
  styleUrls: ['./dashboard-orcamento.component.scss']
})

export class DashboardOrcamentoComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly location: Location,
    private readonly dashboardOrcamentoService: DashboardOrcamentoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly sweetalertService: SweetalertService) {
  }

  public caixa1: number;
  public caixa2: number;
  public caixa3: number;
  public caixa4: number;
  public orcamentos: string[] = [];
  public carregando: boolean = false;
  public titulo: string;

  data: any;

  chartOptions: any;

  ngOnInit(): void {


    if (this.autenticacaoService._tipoUsuario == 1){
      this.dashboardOrcamentoVendedorInterno();
      this.titulo = "Parceiro";
    }else if (this.autenticacaoService._tipoUsuario == 2){
      this.dashboardOrcamentoParceiro();
      this.titulo = "Vendedor";
    }else{
      this.router.navigate(['/']);
    }

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.montarGrafico();
    }, 7000);
  }

  montarGrafico() {

    this.data = {
      labels: ['Orçamentos sem ' + this.titulo, 'Orçamentos com ' + this.titulo, 'Orçamentos Expirados', 'Orçamentos à Expirar'],
      datasets: [
        {
          data: [this.caixa1, this.caixa2, this.caixa3, this.caixa4],
          backgroundColor: [
            "#42A5F5",
            "#66BB6A",
            "#FFA726",
            "#6f42c1"
          ],
          hoverBackgroundColor: [
            "#64B5F6",
            "#81C784",
            "#FFB74D",
            "#6f42c1"
          ]
        }
      ]
    };

    this.updateChartOptions();

  }

  dashboardOrcamentoVendedorInterno() {
    var tresDiasAtras = new Date(); tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
    var tresDiasDepois = new Date(); tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);

    let dataAtual = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));

    let dataTresDiasAtras = DataUtils.formata_dataString_para_formato_data(tresDiasAtras.toLocaleString("pt-br").slice(0, 10));
    let dataTresDiasDepois = DataUtils.formata_dataString_para_formato_data(tresDiasDepois.toLocaleString("pt-br").slice(0, 10));

    this.carregando = true;

    this.dashboardOrcamentoService.dashboardOrcamentoVendedorInterno(this.autenticacaoService._lojaLogado).toPromise().then(response => {
      var indice = 0;
      var caixa1 = 0;
      var caixa2 = 0;
      var caixa3 = 0;
      var caixa4 = 0;

      while (indice < response.length) {

        var dataExpiracaoOrcamento = response[indice].DtExpiracao.toString().slice(0, 10);

        // [Expirados 72h]
        if (dataExpiracaoOrcamento > dataAtual && dataExpiracaoOrcamento <= dataTresDiasDepois) {
          caixa3++;
        }

        // [À expirar 72h]
        if (dataExpiracaoOrcamento < dataAtual && dataExpiracaoOrcamento >= dataTresDiasAtras) {
          caixa4++;
        }

        // [Sem parceiro]
        if (response[indice].Parceiro == "-") {
          caixa1++;
        }

        // [Com parceiro]
        if (response[indice].Parceiro != "-") {
          this.orcamentos.push(response[indice].Parceiro);
          caixa2++;
        }

        indice++;
      }


      this.ordenarOrcamentos();

      this.caixa1 = caixa1;
      this.caixa2 = caixa2;
      this.caixa3 = caixa3;
      this.caixa4 = caixa4;

    }).catch((e) => {
      this.carregando = false;
      this.sweetalertService.aviso("Falha no carregamento do dashboard.");
    });

    this.carregando = false;

  }

  dashboardOrcamentoParceiro() {
    var tresDiasAtras = new Date(); tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
    var tresDiasDepois = new Date(); tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);

    let dataAtual = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));

    let dataTresDiasAtras = DataUtils.formata_dataString_para_formato_data(tresDiasAtras.toLocaleString("pt-br").slice(0, 10));
    let dataTresDiasDepois = DataUtils.formata_dataString_para_formato_data(tresDiasDepois.toLocaleString("pt-br").slice(0, 10));

    this.carregando = true;

    this.dashboardOrcamentoService.dashboardOrcamentoParceiro().toPromise().then(response => {
      var indice = 0;
      var caixa1 = 0;
      var caixa2 = 0;
      var caixa3 = 0;
      var caixa4 = 0;

      console.log(response);
      while (indice < response.length) {

        var dataExpiracaoOrcamento = response[indice].DtExpiracao.toString().slice(0, 10);

        // [Expirados 72h]
        if (dataExpiracaoOrcamento > dataAtual && dataExpiracaoOrcamento <= dataTresDiasDepois) {
          caixa3++;
        }

        // [À expirar 72h]
        if (dataExpiracaoOrcamento < dataAtual && dataExpiracaoOrcamento >= dataTresDiasAtras) {
          caixa4++;
        }

        // [Sem parceiro]
        if (response[indice].IdIndicadorVendedor == null) {
          caixa1++;
        }

        // [Com parceiro]
        if (response[indice].IdIndicadorVendedor != null) {
          this.orcamentos.push(response[indice].VendedorParceiro);
          caixa2++;
        }

        indice++;
      }


      this.ordenarOrcamentos();

      this.caixa1 = caixa1;
      this.caixa2 = caixa2;
      this.caixa3 = caixa3;
      this.caixa4 = caixa4;

    }).catch((e) => {
      this.carregando = false;
      this.sweetalertService.aviso("Falha no carregamento do dashboard.");
    });

    this.carregando = false;

  }

  ordenarOrcamentos() {
    let arrayOrcamentos = this.orcamentos,
      result = arrayOrcamentos.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));

    let sortable = [];
    for (var vehicle in result) {
      sortable.push([vehicle, result[vehicle]]);
    }

    sortable.sort(function (a, b) {
      return a[1] - b[1];
    });

    this.orcamentos = sortable;
  }

  getLightTheme() {
    return {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      }
    }
  }

  getDarkTheme() {
    return {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef'
          }
        }
      }
    }
  }

  updateChartOptions() {
    this.chartOptions = this.getLightTheme();
  }

}