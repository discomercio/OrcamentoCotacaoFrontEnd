import { Component, OnInit } from '@angular/core';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { Constantes } from 'src/app/utilities/constantes';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { RelatorioDadosOrcamento } from 'src/app/dto/orcamentos/relatorio-dados-orcamento';
import { UsuariosPorListaLojasResponse } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-dados-orcamentos',
  templateUrl: './dados-orcamentos.component.html',
  styleUrls: ['./dados-orcamentos.component.scss']
})
export class DadosOrcamentosComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoService: OrcamentosService,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly produtoService: ProdutoService,
    private readonly exportExcelService: ExportExcelService) { }

  carregando: boolean;
  constantes: Constantes = new Constantes();

  filtro: Filtro = new Filtro();
  admModulo: boolean;
  acessoUniversal:boolean;
  usuario = new Usuario();
  tipoUsuario: number;

  cboLojas: Array<DropDownItem> = [];
  lojasApoio: string[];
  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboFiltradoVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboComIndicador: Array<DropDownItem> = [];
  cboDatas: Array<DropDownItem> = [];
  cboOpcoes: Array<DropDownItem> = [];
  dtInicio: Date;
  dtFim: Date;
  configValidade: ValidadeOrcamento;
  fraseRegistrosBase: string = `Foram encontrados [] registros`;
  fraseRegistros: string;
  fraseInicial: string = "Clique em Pesquisar para consultar os registros";
  clicouPesquisar: boolean = false;
  qtdeRegistros: number = 0;
  filtroParceirosApoio: string[];
  filtroCategoriasApoio: string[];
  cboCategorias: Array<DropDownItem> = new Array<DropDownItem>();
  cboFabricantes: Array<DropDownItem> = new Array<DropDownItem>();
  relatorioDadosOrcamento: RelatorioDadosOrcamento;

  ngOnInit(): void {
    this.carregando = true;

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelatoriosGerenciais)) {
      this.carregando = false;
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.RelatoriosGerenciais);
    this.acessoUniversal = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);

    const promises = [this.buscarStatus(), this.buscarVendedores(), this.buscarParceiros(), this.buscarConfigValidade()];
    Promise.all(promises).then((r: Array<any>) => {
      this.setarLojas();
      this.setarStatus(r[0]);
      this.setarVendedores(r[1]);
      // this.setarOpcoes();
      this.setarParceiros(r[2]);
      this.setarOpcoesOrcamento();
      this.setarConfigValidade(r[3]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    }).finally(() => {

      this.carregando = false;
    });

  }

  buscarStatus(): Promise<any> {
    return this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise();
  }

  buscarVendedores(): Promise<UsuariosPorListaLojasResponse> {
    if (this.admModulo) {
      let request = new UsuariosPorListaLojasRequest();

      return this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise();
    }
  }

  buscarParceiros(): Promise<OrcamentistaIndicadorDto[]> {
    return this.orcamentistaIndicadorService.buscarParceirosHabilitados().toPromise()
  }

  buscarConfigValidade(): Promise<ValidadeOrcamento> {
    return this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise();
  }

  setarStatus(status: Array<any>) {
    if (status != null) {
      status = status.filter(x => x.Id != this.constantes.STATUS_ORCAMENTO_COTACAO_EXCLUIDO);
      status.forEach(e => {
        this.cboStatus.push({ Id: e.Id, Value: e.Value });
      });
    }
  }

  setarLojas() {
    let lojasUsuario = this.autenticacaoService.usuario.lojas;
    lojasUsuario.forEach(x => {
      this.cboLojas.push({ Id: x, Value: x });
    });
  }

  setarVendedores(vendedores: UsuariosPorListaLojasResponse) {
    if (this.tipoUsuario.toString() == this.constantes.PARCEIRO.toString() ||
      this.tipoUsuario.toString() == this.constantes.PARCEIRO_VENDEDOR.toString()) return;

    if (vendedores && !vendedores.Sucesso) {
      this.sweetAlertService.aviso(vendedores.Mensagem);
      return;
    }
    if (this.admModulo) {
      this.cboVendedores = new Array<any>();
      vendedores.usuarios.forEach(x => {
        this.cboVendedores.push({ Id: x.id, Value: x.vendedor });
      });
      this.cboFiltradoVendedores = this.cboVendedores;
    }

    this.cboVendedores = this.cboVendedores.sort((a, b) => (a.Value < b.Value ? -1 : 1));
  }

  // setarOpcoes() {
  //   this.cboOpcoes.push({ Id: 0, Value: this.constantes.TODAS_OPCOES });
  //   this.cboOpcoes.push({ Id: 1, Value: this.constantes.OPCOES_APROVADAS });
  // }

  setarParceiros(parceiros: Array<OrcamentistaIndicadorDto>) {
    if (parceiros != null) {
      parceiros.forEach(x => {
        if (!!x.nome) {
          if (!this.cboParceiros.find(f => f.Value == x.nome))
            this.cboParceiros.push({ Id: x.idIndicador, Value: x.nome });
        }
      });

      this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
    }
  }

  setarOpcoesOrcamento() {
    this.cboComIndicador.push({ Id: 0, Value: "Não" });
    this.cboComIndicador.push({ Id: 1, Value: "Sim" });
  }

  setarConfigValidade(config: ValidadeOrcamento) {
    this.configValidade = config;

    let dtIni = new Date(Date.now() - this.configValidade.MaxPeriodoConsulta_RelatorioGerencial * 24 * 60 * 60 * 1000);
    // this.dtInicio = dtIni;
    this.dtFim = new Date();
  }

  pesquisar() {
    this.clicouPesquisar = true;

    this.setarFiltro();
  }

  setarFiltro() {
    if (!this.dtInicio && !this.dtFim) {
      this.alertaService.mostrarMensagem("É necessário preencher ao menos um filtro de data de criação");
      return;
    }

    if (this.dtInicio) {
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(this.dtInicio));
    }
    else {
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(Date.now() - this.configValidade.MaxPeriodoConsulta_RelatorioGerencial * 24 * 60 * 60 * 1000));
    }
    if (this.dtFim) {
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtFim));
    }
    else {
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtInicio.valueOf() + this.configValidade.MaxPeriodoConsulta_RelatorioGerencial * 24 * 60 * 60 * 1000));
    }

    let diferenca = new Date(DataUtils.formataParaFormulario(new Date(this.filtro.DtFim))).valueOf() - new Date(DataUtils.formataParaFormulario(new Date(this.filtro.DtInicio))).valueOf();
    let difDias = diferenca / (1000 * 60 * 60 * 24);
    if (this.configValidade.MaxPeriodoConsulta_RelatorioGerencial < difDias) {
      this.alertaService.mostrarMensagem(`A diferença entre as datas de "Início da criação" e "Fim da criação" ultrapassa o período de ${this.configValidade.MaxPeriodoConsulta_RelatorioGerencial} de dias!`);
      return;
    }

    this.filtroParceirosApoio = this.filtro.Parceiros;
    let filtroParceiro = this.filtro.Parceiros;
    this.filtro.Parceiros = new Array();
    if (filtroParceiro) {
      filtroParceiro.forEach(x => {
        this.filtro.Parceiros.push(x);
      });
    }

    this.filtro.Exportar = false;

    if (!this.lojasApoio) {
      this.filtro.Lojas = this.autenticacaoService._lojasUsuarioLogado;
    } else {
      this.filtro.Lojas = this.lojasApoio;
    }

    this.buscarLista(this.filtro);
  }

  buscarLista(filtro: Filtro) {
    this.carregando = true;
    this.qtdeRegistros = 0;
    this.fraseRegistros = null;
    filtro.LojaLogada = this.autenticacaoService._lojaLogado;
    this.orcamentoService.buscarRelatorioDadosOrcamento(filtro).toPromise().then((r) => {
      this.carregando = false;
      if (!r.Sucesso) {
        this.alertaService.mostrarMensagem(r.Mensagem);
        return;
      }

      this.qtdeRegistros = r.listaDadosOrcamento.length;
      this.fraseRegistros = this.fraseRegistrosBase;
      this.fraseRegistros = this.fraseRegistros.replace("[]", this.qtdeRegistros.toString());
      this.relatorioDadosOrcamento = r;
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }

  exportXlsx() {
    this.exportExcelService.exportAsXLSXFile(this.criarJsonParaExportar(), `relatorio-dados-orcamentos`, true);

    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }

  exportCsv() {
    this.exportExcelService.exportAsCSVFile(this.criarJsonParaExportar(), `relatorio-dados-orcamentos`, true);

    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }

  criarJsonParaExportar(): any[] {
    let json = [];
    this.relatorioDadosOrcamento.listaDadosOrcamento.forEach(x => {
      let item = {
        Loja: { t: 'n', v: x.Loja },
        Orcamento: { t: 'n', v: x.Orcamento },
        Status: x.Status,
        PrePedido: x.PrePedido,
        Pedido: x.Pedido,
        Vendedor: x.Vendedor,
        Indicador: x.Indicador,
        IndicadorVendedor: x.IndicadorVendedor,
        IdCliente: x.IdCliente ? { t: 'n', v: x.IdCliente } : null,
        UsuarioCadastro: x.UsuarioCadastro,
        UF: x.UF,
        TipoCliente: x.TipoCliente,
        ContribuinteIcms: x.ContribuinteIcms,
        QtdeMsgPendente: { t: 'n', v: x.QtdeMsgPendente },
        EntregaImediata: x.EntregaImediata,
        PrevisaoEntrega: x.PrevisaoEntrega ? { t: 'd', v: new Date(new Date(x.PrevisaoEntrega).setSeconds(this.constantes.BUG_DIFERENCA_CONVERSAO_DATA_REL_EXCEL)), z: "dd/MM/yyyy" } : null,
        InstaladorInstala: x.InstaladorInstala,
        ComissaoOpcao1: x.ComissaoOpcao1 ? { t: 'n', v: x.ComissaoOpcao1 / 100, z: "0.0%" } : null,
        DescMedioAVistaOpcao1: x.DescMedioAVistaOpcao1 ? { t: 'n', v: x.DescMedioAVistaOpcao1 / 100, z: "0.00%" } : null,
        DescMedioAPrazoOpcao1: x.DescMedioAPrazoOpcao1 ? { t: 'n', v: x.DescMedioAPrazoOpcao1 / 100, z: "0.00%" } : null,
        FormaPagtoAVistaOpcao1: x.FormaPagtoAVistaOpcao1,
        ValorFormaPagtoAVistaOpcao1: x.ValorFormaPagtoAVistaOpcao1 ? { t: 'n', v: x.ValorFormaPagtoAVistaOpcao1, z: "R$ #,##0.00" } : null,
        StatusDescSuperiorAVistaOpcao1: x.StatusDescSuperiorAVistaOpcao1,
        FormaPagtoAPrazoOpcao1: x.FormaPagtoAPrazoOpcao1,
        ValorFormaPagtoAPrazoOpcao1: x.ValorFormaPagtoAPrazoOpcao1 ? { t: 'n', v: x.ValorFormaPagtoAPrazoOpcao1, z: "R$ #,##0.00" } : null,
        QtdeParcelasFormaPagtoAPrazoOpcao1: x.QtdeParcelasFormaPagtoAPrazoOpcao1 ? { t: 'n', v: x.QtdeParcelasFormaPagtoAPrazoOpcao1 } : null,
        StatusDescSuperiorAPrazoOpcao1: x.StatusDescSuperiorAPrazoOpcao1,
        ComissaoOpcao2: x.ComissaoOpcao2 ? { t: 'n', v: x.ComissaoOpcao2 / 100, z: "0.0%" } : null,
        DescMedioAVistaOpcao2: x.DescMedioAVistaOpcao2 ? { t: 'n', v: x.DescMedioAVistaOpcao2 / 100, z: "0.00%" } : null,
        DescMedioAPrazoOpcao2: x.DescMedioAPrazoOpcao2 ? { t: 'n', v: x.DescMedioAPrazoOpcao2 / 100, z: "0.00%" } : null,
        FormaPagtoAVistaOpcao2: x.FormaPagtoAVistaOpcao2,
        ValorFormaPagtoAVistaOpcao2: x.ValorFormaPagtoAVistaOpcao2 ? { t: 'n', v: x.ValorFormaPagtoAVistaOpcao2, z: "R$ #,##0.00" } : null,
        StatusDescSuperiorAVistaOpcao2: x.StatusDescSuperiorAVistaOpcao2,
        FormaPagtoAPrazoOpcao2: x.FormaPagtoAPrazoOpcao2,
        ValorFormaPagtoAPrazoOpcao2: x.ValorFormaPagtoAPrazoOpcao2 ? { t: 'n', v: x.ValorFormaPagtoAPrazoOpcao2, z: "R$ #,##0.00" } : null,
        QtdeParcelasFormaPagtoAPrazoOpcao2: x.QtdeParcelasFormaPagtoAPrazoOpcao2 ? { t: 'n', v: x.QtdeParcelasFormaPagtoAPrazoOpcao2 } : null,
        StatusDescSuperiorAPrazoOpcao2: x.StatusDescSuperiorAPrazoOpcao2,
        ComissaoOpcao3: x.ComissaoOpcao3 ? { t: 'n', v: x.ComissaoOpcao3 / 100, z: "0.0%" } : null,
        DescMedioAVistaOpcao3: x.DescMedioAVistaOpcao3 ? { t: 'n', v: x.DescMedioAVistaOpcao3 / 100, z: "0.00%" } : null,
        DescMedioAPrazoOpcao3: x.DescMedioAPrazoOpcao3 ? { t: 'n', v: x.DescMedioAPrazoOpcao3 / 100, z: "0.00%" } : null,
        FormaPagtoAVistaOpcao3: x.FormaPagtoAVistaOpcao3,
        ValorFormaPagtoAVistaOpcao3: x.ValorFormaPagtoAVistaOpcao3 ? { t: 'n', v: x.ValorFormaPagtoAVistaOpcao3, z: "R$ #,##0.00" } : null,
        StatusDescSuperiorAVistaOpcao3: x.StatusDescSuperiorAVistaOpcao3,
        FormaPagtoAPrazoOpcao3: x.FormaPagtoAPrazoOpcao3,
        ValorFormaPagtoAPrazoOpcao3: x.ValorFormaPagtoAPrazoOpcao3 ? { t: 'n', v: x.ValorFormaPagtoAPrazoOpcao3, z: "R$ #,##0.00" } : null,
        QtdeParcelasFormaPagtoAPrazoOpcao3: x.QtdeParcelasFormaPagtoAPrazoOpcao3 ? { t: 'n', v: x.QtdeParcelasFormaPagtoAPrazoOpcao3 } : null,
        StatusDescSuperiorAPrazoOpcao3: x.StatusDescSuperiorAPrazoOpcao3,
        OpcaoAprovada: x.OpcaoAprovada ? { t: 'n', v: x.OpcaoAprovada } : null,
        ComissaoOpcaoAprovada: x.ComissaoOpcaoAprovada ? { t: 'n', v: x.ComissaoOpcaoAprovada / 100, z: "0.0%" } : null,
        DescMedioOpcaoAprovada: x.DescMedioOpcaoAprovada ? { t: 'n', v: x.DescMedioOpcaoAprovada / 100, z: "0.00%" } : null,
        FormaPagtoOpcaoAprovada: x.FormaPagtoOpcaoAprovada,
        ValorFormaPagtoOpcaoAprovada: x.ValorFormaPagtoOpcaoAprovada ? { t: 'n', v: x.ValorFormaPagtoOpcaoAprovada, z: "R$ #,##0.00" } : null,
        QtdeParcelasFormaOpcaoAprovada: x.QtdeParcelasFormaOpcaoAprovada ? { t: 'n', v: x.QtdeParcelasFormaOpcaoAprovada } : null,
        StatusDescSuperiorOpcaoAprovada: x.StatusDescSuperiorOpcaoAprovada,
        DataCadastro: x.DataCadastro ? { t: 'd', v: new Date(new Date(x.DataCadastro).setSeconds(this.constantes.BUG_DIFERENCA_CONVERSAO_DATA_REL_EXCEL)), z: "dd/MM/yyyy" } : null,
        Validade: x.Validade ? { t: 'd', v: new Date(new Date(x.Validade).setSeconds(this.constantes.BUG_DIFERENCA_CONVERSAO_DATA_REL_EXCEL)), z: "dd/MM/yyyy" } : null
      }

      json.push(item);
    });
    /*
     *  ESTAMOS ADICIONANDO 28 SEGUNDOS NAS DATA, POIS EXISTE UM BUG NA LIB AO CONVERTER DATA NA GERAÇÃO DE EXCEL
     *  AS DATAS NÃO TEM HORA, MINUTOS E SEGUNDOS
     *  OCORRIA QUE AS DATAS ESTAVAM PERDENDO UM DIA
     *  Ex.:
     *      entrada => 2023-10-09 00:00:00
     *      saida => 2023-10-08 23:59:32
     *      
     *  APLICANDO ESSE AJUSTE, AS DATAS NO EXCEL NÃO DEVEM CONTER HORA, MINUTOS E SEGUNDOS
     *  CASO OCORRA DE SURGIR HORA, MINUTOS E SEGUNDOS, DEVEMOS CONVERSAR NOVAMENTE COM O HAMILTON SOBRE O OCORRIDO.
     */

    return json;
  }
}
