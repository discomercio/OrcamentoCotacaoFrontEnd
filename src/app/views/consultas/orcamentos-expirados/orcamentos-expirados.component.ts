import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentosComponent } from '../orcamentos/orcamentos.component';

@Component({
  selector: 'app-orcamentos-expirados',
  templateUrl: './orcamentos-expirados.component.html',
  styleUrls: ['./orcamentos-expirados.component.scss']
})
export class OrcamentosExpiradosComponent implements OnInit, AfterViewInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  ngOnInit(): void {
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelOrcamentosExpirados)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
    }
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeLista = "expirados";
    this.orcamentos.colunaOrdenacao = "orcamento"
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = "orcamento";
    this.orcamentos.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.orcamentos.ascendente;
    this.orcamentos.consultaOrcamentoGerencialResquest.expirado = true;
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;
    this.orcamentos.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService.usuario.lojas;
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }
}
