import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentosComponent } from '../orcamentos/orcamentos.component';

@Component({
  selector: 'app-orcamentos-vigentes',
  templateUrl: './orcamentos-vigentes.component.html',
  styleUrls: ['./orcamentos-vigentes.component.scss']
})
export class OrcamentosVigentesComponent implements OnInit, AfterViewInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly router: Router) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  urlAnterior: any;

  ngOnInit(): void {

    // this.urlAnterior = this.router.transitions.value.currentSnapshot.url;
    this.urlAnterior = sessionStorage.getItem("urlAnterior");
    
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelOrcamentosVigente)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
    }
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeLista = "vigentes";
    this.orcamentos.colunaOrdenacao = "orcamento"
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = "orcamento";
    this.orcamentos.consultaOrcamentoGerencialResquest.status = new Array<number>();
    this.orcamentos.consultaOrcamentoGerencialResquest.status.push(1);
    this.orcamentos.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.orcamentos.ascendente;
    this.orcamentos.consultaOrcamentoGerencialResquest.dataCorrente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;

    // debugger;
    let parca: any;
    let fab: any;
    let vendedor :any;
    if (this.urlAnterior && this.urlAnterior.indexOf("/aprovar-orcamento/") > -1) {
      let sessionStorageFiltro = sessionStorage.getItem("filtro");
      if (sessionStorageFiltro) {
        this.orcamentos.consultaOrcamentoGerencialResquest = JSON.parse(sessionStorageFiltro);

        if (this.orcamentos.consultaOrcamentoGerencialResquest.lojasSelecionadas != null)
          this.orcamentos.lojas = this.orcamentos.consultaOrcamentoGerencialResquest.lojasSelecionadas;
        if (this.orcamentos.consultaOrcamentoGerencialResquest.pagina > 0)
          this.orcamentos.first = (this.orcamentos.consultaOrcamentoGerencialResquest.pagina) * this.orcamentos.qtdePorPaginaInicial;

        vendedor = this.orcamentos.consultaOrcamentoGerencialResquest.vendedorSelecionado;

        this.orcamentos.parceiro = this.orcamentos.consultaOrcamentoGerencialResquest.parceiroSelecionado;
        parca = this.orcamentos.parceiro;

        if (this.orcamentos.consultaOrcamentoGerencialResquest.comParceiro == undefined) this.orcamentos.comParceiro = null;
        if (this.orcamentos.consultaOrcamentoGerencialResquest.comParceiro) this.orcamentos.comParceiro = 1;
        if (this.orcamentos.consultaOrcamentoGerencialResquest.comParceiro == false) this.orcamentos.comParceiro = 2;

        this.orcamentos.fabricante = this.orcamentos.consultaOrcamentoGerencialResquest.fabricante;
        fab = this.orcamentos.fabricante;

        this.orcamentos.grupo = this.orcamentos.consultaOrcamentoGerencialResquest.grupo;

        // DataUtils.formata_dataString_para_formato_data(this.orcamentos.consultaOrcamentoGerencialResquest.dataCriacaoInicio.toLocaleString("pt-br").slice(0, 10));
        if (this.orcamentos.consultaOrcamentoGerencialResquest.dataCriacaoInicio)
          this.orcamentos.dtCriacaoInicio = DataUtils.formata_formulario_date(this.orcamentos.consultaOrcamentoGerencialResquest.dataCriacaoInicio.toLocaleString("pt-br").slice(0, 10));
        if (this.orcamentos.consultaOrcamentoGerencialResquest.dataCriacaoFim)
          this.orcamentos.dtCriacaoFim = DataUtils.formata_formulario_date(this.orcamentos.consultaOrcamentoGerencialResquest.dataCriacaoFim.toLocaleString("pt-br").slice(0, 10));

      }
    }
    else sessionStorage.removeItem("filtro");

    this.orcamentos.buscarCboVendedores();
    setTimeout(() => {
      // precisamos de um tempo para poder carregar... 
      this.orcamentos.parceiro = parca;
      this.orcamentos.fabricante = fab;
      this.orcamentos.vendedor = vendedor;
      this.orcamentos.form.controls.fabricante.setValue(fab);
      this.orcamentos.form.controls.grupo.setValue(this.orcamentos.grupo);
    }, 3000);
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }

  ngOnDestroy(){
    debugger;
    sessionStorage.removeItem("urlAnterior");
    sessionStorage.removeItem("filtro");
  }
}
