import { Component, OnInit } from '@angular/core';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Constantes } from 'src/app/utilities/constantes';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { UsuariosPorListaLojasResponse } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { GrupoSubgrupoProdutoRequest } from 'src/app/dto/produtos/grupo-subgrupo-produto-request';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { ListaGruposSubgruposProdutosResponse } from 'src/app/dto/produtos/lista-grupos-subgrupos-produtos-response';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { RelatorioItensOrcamento } from 'src/app/dto/orcamentos/relatorio-itens-orcamento';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-itens-orcamentos',
  templateUrl: './itens-orcamentos.component.html',
  styleUrls: ['./itens-orcamentos.component.scss']
})
export class ItensOrcamentosComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoService: OrcamentosService,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly produtoService: ProdutoService,
    private readonly produtoCatalogoService: ProdutoCatalogoService,
    private readonly exportExcelService: ExportExcelService) { }

  carregando: boolean;
  constantes: Constantes = new Constantes();

  filtro: Filtro = new Filtro();
  admModulo: boolean;
  usuario = new Usuario();
  tipoUsuario: number;

  cboLojas: Array<DropDownItem> = [];
  lojasApoio: string[];
  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboFiltradoVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
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
  relatorioItensOrcamento: RelatorioItensOrcamento;

  ngOnInit(): void {
    this.carregando = true;

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.RelatoriosGerenciais))  {
      this.carregando = false;
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.RelatoriosGerenciais);

    const promises = [this.buscarStatus(), this.buscarVendedores(), this.buscarParceiros(), this.buscarConfigValidade(),
    this.buscarCategorias(), this.buscarFabricantes()];
    Promise.all(promises).then((r: Array<any>) => {
      this.setarLojas();
      this.setarStatus(r[0]);
      this.setarVendedores(r[1]);
      this.setarOpcoes();
      this.setarParceiros(r[2]);
      this.setarOpcoesOrcamento();
      this.setarConfigValidade(r[3]);
      this.setarCategorias(r[4]);
      this.setarFabricantes(r[5]);
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

  buscarCategorias(): Promise<ListaGruposSubgruposProdutosResponse> {
    let request = new GrupoSubgrupoProdutoRequest();
    request.lojas = this.usuario.lojas;
    return this.produtoService.buscarGruposSubgruposProdutosPorLojas(request).toPromise();
  }

  buscarFabricantes(): Promise<ProdutoCatalogoFabricante[]> {
    return this.produtoCatalogoService.buscarFabricantes().toPromise();
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

  setarOpcoes() {
    this.cboOpcoes.push({ Id: 0, Value: this.constantes.TODAS_OPCOES });
    this.cboOpcoes.push({ Id: 1, Value: this.constantes.OPCOES_APROVADAS });
  }

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
    this.dtInicio = dtIni;
    this.dtFim = new Date();
  }

  setarCategorias(r: ListaGruposSubgruposProdutosResponse) {
    if (!r.Sucesso) {
      this.sweetAlertService.aviso(r.Mensagem);
      return;
    }

    r.listaGruposSubgruposProdutos.forEach(x => {
      this.cboCategorias.push({ Id: x.codigo, Value: x.descricao });
    });
  }

  setarFabricantes(r: ProdutoCatalogoFabricante[]) {
    if (r != null) {
      r.forEach(x => {
        this.cboFabricantes.push({ Id: x.Fabricante, Value: x.Nome });
      })
    }
  }

  pesquisar() {
    // this.sweetAlertService.aviso("Estamos implementando!");

    this.clicouPesquisar = true;

    this.setarFiltro();
  }

  setarFiltro() {
    if (!this.dtInicio && !this.dtFim) {
      this.alertaService.mostrarMensagem("É necessário preencher ao menos um filtro de data de criação");
      return;
    }
    if (this.dtInicio && this.dtFim) {
      let diferenca = new Date(DataUtils.formataParaFormulario(this.dtFim)).valueOf() - new Date(DataUtils.formataParaFormulario(this.dtInicio)).valueOf();
      let difDias = diferenca / (1000 * 60 * 60 * 24);
      if (this.configValidade.MaxPeriodoConsulta_RelatorioGerencial < difDias) {
        this.alertaService.mostrarMensagem(`A diferença entre as datas de "Início da criação" e "Fim da criação" ultrapassa o período de ${this.configValidade.MaxPeriodoConsulta_RelatorioGerencial} de dias!`);
        return;
      }
    }
    if (this.dtInicio) {
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(this.dtInicio));
    }
    else {
      this.filtro.DtInicio = new Date(Date.now() - this.configValidade.MaxPeriodoConsulta_RelatorioGerencial * 24 * 60 * 60 * 1000);
    }
    if (this.dtFim) {
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtFim));
    }
    else {
      this.filtro.DtFim = new Date(this.dtInicio.valueOf() + this.configValidade.MaxPeriodoConsulta_RelatorioGerencial * 24 * 60 * 60 * 1000);;
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
    this.orcamentoService.buscarRelatorioItensOrcamento(filtro).toPromise().then((r) => {
      this.carregando = false;
      if (!r.Sucesso) {
        this.alertaService.mostrarMensagem(r.Mensagem);
        return;
      }

      this.qtdeRegistros = r.listaItensOrcamento.length;
      this.fraseRegistros = this.fraseRegistrosBase;
      this.fraseRegistros = this.fraseRegistros.replace("[]", this.qtdeRegistros.toString());
      this.relatorioItensOrcamento = r;
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }

  exportXlsx() {
    let json = [];
    this.relatorioItensOrcamento.listaItensOrcamento.forEach(x => {
      let item = {
        Loja: { t: 'n', v: x.Loja },
        Orcamento: { t: 'n', v: x.Orcamento },
        PrePedido: x.PrePedido,
        Pedido: x.Pedido,
        Status: x.Status,
        Vendedor: x.Vendedor,
        Indicador: x.Indicador,
        IndicadorVendedor: x.IndicadorVendedor,
        UsuarioCadastro: x.UsuarioCadastro,
        IdCliente: { t: 'n', v: x.IdCliente },
        UF: x.UF,
        TipoCliente: x.TipoCliente,
        ContribuinteIcms: x.ContribuinteIcms,
        EntregaImediata: x.EntregaImediata,
        PrevisaoEntrega: x.PrevisaoEntrega ? { t: 'd', v: x.PrevisaoEntrega, z: "dd/MM/yyyy" } : null,
        InstaladorInstala: x.InstaladorInstala,
        NumOpcaoOrcamento: { t: 'n', v: x.NumOpcaoOrcamento },
        FormaPagtoAVista: x.FormaPagtoAVista,
        FormaPagtoAPrazo: x.FormaPagtoAPrazo,
        QtdeParcelasFormaPagtoAPrazo: x.QtdeParcelasFormaPagtoAPrazo ? { t: 'n', v: x.QtdeParcelasFormaPagtoAPrazo } : null,
        OpcaoAprovada: x.OpcaoAprovada,
        FormaPagtoOpcaoAprovada: x.FormaPagtoOpcaoAprovada,
        Fabricante: x.Fabricante,
        Produto: x.Produto,
        Qtde: { t: 'n', v: x.Qtde },
        DescricaoProduto: x.DescricaoProduto,
        Categoria: x.Categoria,
        PrecoListaUnitAVista: x.PrecoListaUnitAVista ? { t: 'n', v: x.PrecoListaUnitAVista, z: "R$ #,##0.00" } : null,
        PrecoListaUnitAPrazo: x.PrecoListaUnitAPrazo ? { t: 'n', v: x.PrecoListaUnitAPrazo, z: "R$ #,##0.00" } : null,
        PrecoNFUnitAVista: x.PrecoNFUnitAVista ? { t: 'n', v: x.PrecoNFUnitAVista, z: "R$ #,##0.00" } : null,
        PrecoNFUnitAPrazo: x.PrecoNFUnitAPrazo ? { t: 'n', v: x.PrecoNFUnitAPrazo, z: "R$ #,##0.00" } : null,
        DescontoAVista: x.DescontoAVista ? { t: 'n', v: x.DescontoAVista /100, z: "0.00%" } : null,
        DescontoAPrazo: x.DescontoAPrazo ? { t: 'n', v: x.DescontoAPrazo /100, z: "0.00%" } : null,
        DescSuperiorAVista: x.DescSuperiorAVista ? { t: 'n', v: x.DescSuperiorAVista/100, z: "0.00%" } : null,
        DescSuperiorAPrazo: x.DescSuperiorAPrazo ? { t: 'n', v: x.DescSuperiorAPrazo/100, z: "0.00%" } : null,
        Comissao: x.Comissao ? { t: 'n', v: x.Comissao/100, z: "0.0%" } : null,
        DataCadastro: x.DataCadastro ? { t: 'd', v: x.DataCadastro, z: "dd/MM/yyyy" } : null,
        Validade: x.Validade ? { t: 'd', v: x.Validade, z: "dd/MM/yyyy" } : null
      }

      json.push(item);
    });
    this.exportExcelService.exportAsXLSXFile(json, `relatorio-itens-orcamentos`, true);

    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }

  exportCsv() {
    let json = [];
    this.relatorioItensOrcamento.listaItensOrcamento.forEach(x => {
      let item = {
        Loja: { t: 'n', v: x.Loja },
        Orcamento: { t: 'n', v: x.Orcamento },
        PrePedido: x.PrePedido,
        Pedido: x.Pedido,
        Status: x.Status,
        Vendedor: x.Vendedor,
        Indicador: x.Indicador,
        IndicadorVendedor: x.IndicadorVendedor,
        UsuarioCadastro: x.UsuarioCadastro,
        IdCliente: { t: 'n', v: x.IdCliente },
        UF: x.UF,
        TipoCliente: x.TipoCliente,
        ContribuinteIcms: x.ContribuinteIcms,
        EntregaImediata: x.EntregaImediata,
        PrevisaoEntrega: x.PrevisaoEntrega ? { t: 'd', v: x.PrevisaoEntrega, z: "dd/MM/yyyy" } : null,
        InstaladorInstala: x.InstaladorInstala,
        NumOpcaoOrcamento: { t: 'n', v: x.NumOpcaoOrcamento },
        FormaPagtoAVista: x.FormaPagtoAVista,
        FormaPagtoAPrazo: x.FormaPagtoAPrazo,
        QtdeParcelasFormaPagtoAPrazo: x.QtdeParcelasFormaPagtoAPrazo ? { t: 'n', v: x.QtdeParcelasFormaPagtoAPrazo } : null,
        OpcaoAprovada: x.OpcaoAprovada,
        FormaPagtoOpcaoAprovada: x.FormaPagtoOpcaoAprovada,
        Fabricante: x.Fabricante,
        Produto: x.Produto,
        Qtde: { t: 'n', v: x.Qtde },
        DescricaoProduto: x.DescricaoProduto,
        Categoria: x.Categoria,
        PrecoListaUnitAVista: x.PrecoListaUnitAVista ? { t: 'n', v: x.PrecoListaUnitAVista, z: "R$ #,##0.00" } : null,
        PrecoListaUnitAPrazo: x.PrecoListaUnitAPrazo ? { t: 'n', v: x.PrecoListaUnitAPrazo, z: "R$ #,##0.00" } : null,
        PrecoNFUnitAVista: x.PrecoNFUnitAVista ? { t: 'n', v: x.PrecoNFUnitAVista, z: "R$ #,##0.00" } : null,
        PrecoNFUnitAPrazo: x.PrecoNFUnitAPrazo ? { t: 'n', v: x.PrecoNFUnitAPrazo, z: "R$ #,##0.00" } : null,
        DescontoAVista: x.DescontoAVista ? { t: 'n', v: x.DescontoAVista /100, z: "0.00%" } : null,
        DescontoAPrazo: x.DescontoAPrazo ? { t: 'n', v: x.DescontoAPrazo /100, z: "0.00%" } : null,
        DescSuperiorAVista: x.DescSuperiorAVista ? { t: 'n', v: x.DescSuperiorAVista/100, z: "0.00%" } : null,
        DescSuperiorAPrazo: x.DescSuperiorAPrazo ? { t: 'n', v: x.DescSuperiorAPrazo/100, z: "0.00%" } : null,
        Comissao: x.Comissao ? { t: 'n', v: x.Comissao/100, z: "0.0%" } : null,
        DataCadastro: x.DataCadastro ? { t: 'd', v: x.DataCadastro, z: "dd/MM/yyyy" } : null,
        Validade: x.Validade ? { t: 'd', v: x.Validade, z: "dd/MM/yyyy" } : null
      }
      json.push(item);
    });
    this.exportExcelService.exportAsCSVFile(json, `relatorio-itens-orcamentos`, true);
    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }
}