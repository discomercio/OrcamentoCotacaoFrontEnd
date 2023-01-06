import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentosComponent } from '../orcamentos/orcamentos.component';

@Component({
  selector: 'app-orcamentos-expirados',
  templateUrl: './orcamentos-expirados.component.html',
  styleUrls: ['./orcamentos-expirados.component.scss']
})
export class OrcamentosExpiradosComponent implements OnInit, AfterViewInit {

  constructor(private readonly autenticacaoService: AutenticacaoService) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.expirado = true;
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;
    this.orcamentos.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService.usuario.lojas;
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }
}
