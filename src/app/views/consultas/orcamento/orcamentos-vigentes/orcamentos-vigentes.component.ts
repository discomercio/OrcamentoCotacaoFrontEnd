import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
    private readonly sweetAlertService: SweetalertService) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  ngOnInit(): void {
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelOrcamentosVigente)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
    }
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeLista = "vigentes";
    this.orcamentos.colunaOrdenacao = "orcamento"
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = "orcamento";
    this.orcamentos.consultaOrcamentoGerencialResquest.status = 1;
    this.orcamentos.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.orcamentos.ascendente;
    this.orcamentos.consultaOrcamentoGerencialResquest.dataCorrente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }
}
