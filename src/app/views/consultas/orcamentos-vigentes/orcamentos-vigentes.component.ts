import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ConsultaGerencialOrcamentoRequest } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-request';
import { ConsultaGerencialOrcamentoResponse } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-response';
import { ListaConsultaGerencialOrcamentoResponse } from 'src/app/dto/orcamentos/lista-consulta-gerencial-orcamento-response';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentosComponent } from '../orcamentos/orcamentos.component';

@Component({
  selector: 'app-orcamentos-vigentes',
  templateUrl: './orcamentos-vigentes.component.html',
  styleUrls: ['./orcamentos-vigentes.component.scss']
})
export class OrcamentosVigentesComponent implements OnInit, AfterViewInit {

  constructor(private readonly autenticacaoService: AutenticacaoService) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.ordenacaoAscendente = false;
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = "Id";
    this.orcamentos.consultaOrcamentoGerencialResquest.dataCorrente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;
    this.orcamentos.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService.usuario.lojas;
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }
}
