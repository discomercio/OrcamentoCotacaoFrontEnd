import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentosComponent } from '../orcamentos/orcamentos.component';

@Component({
  selector: 'app-orcamentos-com-mensagens-pendentes',
  templateUrl: './orcamentos-com-mensagens-pendentes.component.html',
  styleUrls: ['./orcamentos-com-mensagens-pendentes.component.scss']
})
export class OrcamentosComMensagensPendentesComponent implements OnInit, AfterViewInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

  @ViewChild("orcamentos", { static: false }) orcamentos: OrcamentosComponent;

  ngOnInit(): void {
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelOrcamentosMensagemPendente)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
    }
  }

  ngAfterViewInit(): void {
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeLista = "pendentes";
    this.orcamentos.colunaOrdenacao = "orcamento"
    this.orcamentos.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = "orcamento";
    this.orcamentos.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.orcamentos.ascendente;
    this.orcamentos.consultaOrcamentoGerencialResquest.status = new Array<number>();
    this.orcamentos.consultaOrcamentoGerencialResquest.status.push(1);
    this.orcamentos.consultaOrcamentoGerencialResquest.dataCorrente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    this.orcamentos.consultaOrcamentoGerencialResquest.mensagemPendente = true;
    this.orcamentos.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.orcamentos.qtdePorPaginaInicial;
    this.orcamentos.buscarLista(this.orcamentos.consultaOrcamentoGerencialResquest);
    this.orcamentos.cdr.detectChanges();
  }
}
