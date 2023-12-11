import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { enumParametros } from '../enumParametros';
import { OrcamentoCotacaoStatus } from '../models/OrcamentoCotacaoStatus';
import { DropDownItem } from '../models/DropDownItem';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ButtonArClubeComponent } from 'src/app/components/button/button-arclube.component';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { ListaDto, ListaDtoExport } from 'src/app/dto/orcamentos/lista-dto';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { PrepedidoRemoverService } from 'src/app/service/prepedido/prepedido-remover.service';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { PedidoService } from 'src/app/service/pedido/pedido.service';
import { CodigoDescricaoRequest } from 'src/app/dto/codigo-descricao/codigo-descricao-request';
import { LazyLoadEvent } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { UsuariosPorListaLojasResponse } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-response';
import { ListaCodigoDescricaoResponse } from 'src/app/dto/codigo-descricao/lista-codigo-descricao-response';
import { CodigoDescricaoResponse } from 'src/app/dto/codigo-descricao/codigo-descricao-response';
import { newArray } from '@angular/compiler/src/util';
import { PrepedidoService } from 'src/app/service/prepedido/orcamento/prepedido.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class OrcamentosListarComponent implements OnInit {

  @ViewChild(ButtonArClubeComponent, { static: false })
  button: ButtonArClubeComponent

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly orcamentoService: OrcamentosService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly prepedidoRemoverService: PrepedidoRemoverService,
    private readonly sweetalertService: SweetalertService,
    private readonly sweetAlertService: SweetalertService,
    private readonly usuarioService: UsuariosService,
    private readonly pedidoService: PedidoService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly prepedidoService: PrepedidoService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  public form: FormGroup;
  inscricao: Subscription;
  param: string;
  selectedFiltros: SelectItem;
  lstFiltro: SelectItem[];
  filtro: Filtro = new Filtro();
  VendedorParceiros: string[];
  cols: any[];

  lstDto: Array<ListaDto> = new Array();
  lstDtoFiltrada: Array<ListaDto> = new Array();
  lstStatus: Array<OrcamentoCotacaoStatus>;
  lstParceiros: Array<OrcamentistaIndicadorDto>;

  cboStatus: Array<DropDownItem> = new Array();
  cboVendedores: Array<DropDownItem> = new Array();
  cboFiltradoVendedores: Array<DropDownItem> = new Array();
  cboParceiros: Array<DropDownItem> = new Array();
  cboVendedoresParceiros: Array<DropDownItem> = new Array();
  cboMensagens: Array<DropDownItem> = new Array();
  cboDatas: Array<DropDownItem> = new Array();

  idValuesTmp = 0;

  nome_numero: string;
  moedaUtils: MoedaUtils = new MoedaUtils();
  dataUtils: DataUtils = new DataUtils();
  parametro: string;
  lojaLogada: string = this.autenticacaoService._lojaLogado;

  public constantes: Constantes = new Constantes();
  usuario = new Usuario();
  public lstVendedores: SelectItem[] = [];
  public lstVendedoresParceiros: SelectItem[] = [];
  public lstParceiro: SelectItem[] = [];
  tipoUsuario: number;
  admModulo: boolean;
  vendedorSelecionado: DropDownItem;
  configValidade: ValidadeOrcamento;

  first: number = 0;
  qtdeRegistros: number;
  qtdePorPaginaInicial: number = 10;
  qtdePorPaginaSelecionado: number = 10;
  mostrarQtdePorPagina: boolean = false;
  carregandoVendedoresParceiros: boolean;

  dtInicio: Date;
  dtFim: Date;
  dtInicioExpiracao: Date;
  dtFimExpiracao: Date;
  clicouPesquisar: boolean;
  carregando: boolean;
  listaCodigoDescricao: Array<CodigoDescricaoRequest> = new Array<CodigoDescricaoRequest>();
  filtroParceirosApoio: string[];
  paramMsgPendentes: boolean;
  visualizando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarTabela();
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);
    this.filtro.qtdeItensPagina = this.qtdePorPaginaInicial;

    const promises = [this.buscarConfigValidade(),
    this.buscarVendedores(), this.buscarStatus(), this.buscarParceiros()];

    Promise.all(promises).then((r: Array<any>) => {
      this.setarConfigValidade(r[0]);
      this.setarVendedores(r[1]);
      this.setarStatus(r[2]);
      this.setarParceiros(r[3]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    }).finally(() => {
      this.carregando = false;
      this.pesquisaAuto();
    });

    this.criarTabela();
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);
    this.setarCamposDoForm();
    this.buscarMensagens();

  }

  setarConfigValidade(config: ValidadeOrcamento) {
    this.configValidade = config;

    let dtIni = new Date(Date.now() - this.configValidade.MaxPeriodoConsultaFiltroPesquisa * 24 * 60 * 60 * 1000);
    this.dtInicio = dtIni;
    this.dtFim = new Date();

    // this.pesquisar();
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

  setarStatus(status: Array<any>) {
    if (this.parametro == "ORCAMENTOS") {
      if (this.autenticacaoService._usuarioLogado) {
        if (status != null) {
          status = status.filter(x => x.Id != this.constantes.STATUS_ORCAMENTO_COTACAO_EXCLUIDO);
          status.forEach(e => {
            this.cboStatus.push({ Id: e.Id, Value: e.Value });
          });
        }
      }
    }
    else if (this.parametro == "PEDIDOS") {
      let statusPedido = new ListaCodigoDescricaoResponse();
      statusPedido.Sucesso = status["Sucesso"];

      if (!statusPedido.Sucesso) {
        this.sweetAlertService.aviso(statusPedido.Mensagem);
        return;
      }
      statusPedido.listaCodigoDescricao = new Array<CodigoDescricaoResponse>();
      statusPedido.listaCodigoDescricao = status["listaCodigoDescricao"];
      statusPedido.listaCodigoDescricao.forEach(e => {
        this.cboStatus.push({ Id: e.codigo, Value: e.descricao });
      });
      this.listaCodigoDescricao = statusPedido.listaCodigoDescricao;
    }
    else {
      this.cboStatus.push({ Id: 1, Value: "Pedido em andamento" });
      this.cboStatus.push({ Id: 2, Value: "Pedido em processamento" });
      this.cboStatus.push({ Id: 3, Value: "Cancelado" });
    }
  }

  setarParceiros(parceiros: Array<OrcamentistaIndicadorDto>) {
    if (parceiros != null) {
      parceiros.forEach(x => {
        if (!!x.nome) {
          if (!this.cboParceiros.find(f => f.Value == x.nome))
            this.cboParceiros.push({ Id: (this.idValuesTmp++).toString(), Value: x.nome });
        }
      });

      this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
    }

    if (this.tipoUsuario == this.constantes.PARCEIRO) {
      let filtro = new Array<string>();
      filtro.push(this.usuario.nome);
      this.buscarVendedoresDoParceiro(filtro);
    }
  }

  buscarStatus(): Promise<any> {
    if (this.parametro == "ORCAMENTOS") {
      if (this.autenticacaoService._usuarioLogado) {
        return this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise();
      }
    }
    else if (this.parametro == "PEDIDOS") {
      let filtro: CodigoDescricaoRequest = new CodigoDescricaoRequest();
      filtro.grupo = "Pedido_St_Entrega";
      return this.pedidoService.statusPorFiltro(filtro).toPromise()
    }
    else {
      let lista = new Array();
      lista.push({ Id: 1, Value: "Pedido em andamento" });
      lista.push({ Id: 2, Value: "Pedido em processamento" });
      lista.push({ Id: 3, Value: "Cancelado" });
      return new Promise<any>((resolve, reject) => {
        resolve(lista);
      });
    }
  }

  buscarVendedores(): Promise<UsuariosPorListaLojasResponse> {
    if (this.admModulo) {
      let request = new UsuariosPorListaLojasRequest();
      request.lojas = [];
      request.lojas.push(this.autenticacaoService._lojaLogado);

      return this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise();
    }
  }

  buscarParceiros(): Promise<OrcamentistaIndicadorDto[]> {
    return this.orcamentistaIndicadorService.buscarParceirosPorLoja(this.autenticacaoService._lojaLogado).toPromise()
  }

  cboParceiro_onChange() {

    this.cboVendedoresParceiros = new Array<DropDownItem>();
    this.filtro.IdIndicadorVendedor = null;
    if (this.filtro.Parceiros != undefined && this.filtro.Parceiros.length > 0) {
      this.buscarVendedoresDoParceiro(this.filtro.Parceiros);
    }
  }

  buscarVendedoresDoParceiro(parceiros: string[]) {
    this.carregandoVendedoresParceiros = true;

    this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorParceiros(parceiros).toPromise().then((r) => {
      if (r != null) {
        r.forEach(x => {
          if (!!x.nome) {
            if (!this.cboVendedoresParceiros.find(f => f.Value == x.nome))
              this.cboVendedoresParceiros.push({ Id: x.id, Value: x.nome });
          }
        });
        this.carregandoVendedoresParceiros = false;

        if (this.filtro.VendedorParceiros && this.filtro.VendedorParceiros.length > 0) {
          this.VendedorParceiros = this.filtro.VendedorParceiros;
        }
      }
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
      this.carregandoVendedoresParceiros = false;
    });
  }

  buscarMensagens() {
    // if(this.paramMsgPendentes){

    // }
    if (this.tipoUsuario != this.constantes.PARCEIRO_VENDEDOR) {
      this.cboMensagens.push({ Id: 3, Value: "Sim - Todas" });
      this.cboMensagens.push({ Id: 2, Value: "Sim - Somente as minhas" });
      this.cboMensagens.push({ Id: 1, Value: "Sim - Somente de terceiros" });
      this.cboMensagens.push({ Id: 0, Value: "Não" });
    }
    else {
      this.cboMensagens.push({ Id: 0, Value: "Não" });
      this.cboMensagens.push({ Id: 1, Value: "Sim" });
    }

    this.buscarDatas();
  }

  buscarDatas() {
    this.cboDatas = [];
    this.lstDto.forEach(x => {
      if (!this.cboDatas.find(f => (new Date(f.Value)) >= this.filtro.DtInicio && (new Date(f.Value) <= this.filtro.DtFim))) {
        this.cboDatas.push({ Id: (this.idValuesTmp++).toString(), Value: x.DtCadastro.toString() });
      }
    });
  }

  buscarConfigValidade(): Promise<ValidadeOrcamento> {
    return this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise();
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();

    if (this.parametro == "MSGPENDENTES") {
      this.parametro = "ORCAMENTOS";
      if (this.tipoUsuario != this.constantes.PARCEIRO_VENDEDOR) {
        this.filtro.Mensagem = "Sim - Somente as minhas";
      }
      else {
        this.filtro.Mensagem = "Sim";
      }
      this.paramMsgPendentes = true;
      return;
    }

    this.paramMsgPendentes = false;
  }

  criarForm() {
    this.form = this.fb.group({
      status: [[]],
      cliente: [''],
      vendedor: [[]],
      parceiro: [[]],
      vendedorParceiro: [[]],
      msgPendente: [''],
      dtInicio: [this.filtro.DtInicio],
      dtFim: [this.filtro.DtFim],
      filtroStatus: [''],
      dtFimExpiracao: [this.filtro.DtFimExpiracao],
      dtInicioExpiracao: [this.filtro.DtInicioExpiracao]
    });
  }

  setarCamposDoForm(): void {

    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS && !this.admModulo) {
      this.filtro.Vendedor = this.usuario.nome;
    }
    if (this.tipoUsuario == this.constantes.PARCEIRO) {
      this.filtro.Parceiro = this.usuario.nome;
    }

    if (this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
      // this.filtro.Parceiro = this.usuario.idParceiro;
      this.filtro.VendedorParceiro = this.usuario.nome;
      this.filtro.IdIndicadorVendedor = this.usuario.id;
    }
  }

  criarTabela() {
    this.cols = [
      { field: 'NumeroOrcamento', header: 'Orçamento' },
      { field: 'NumPedido', header: 'Pedido', visible: (this.parametro == enumParametros.ORCAMENTOS ? 'none' : ' ') },
      { field: 'Cliente_Obra', header: 'Cliente' },
      { field: 'Vendedor', header: 'Vendedor' },
      { field: 'Parceiro', header: 'Parceiro' },
      { field: 'VendedorParceiro', header: 'Vendedor do Parceiro' },
      { field: 'Valor', header: 'Valor', visible: (this.parametro == enumParametros.ORCAMENTOS ? 'none' : '') },
      { field: 'Status', header: 'Status' },
      { field: 'Mensagem', header: 'Msg. Pendente', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
      { field: 'DtExpiracao', header: 'Expiração', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
      { field: 'DtCadastro', header: 'Criação' },
      { field: 'Editar', header: " ", visible: 'none' },
      { field: 'St_Orc_Virou_Pedido', header: 'St_Orc_Virou_Pedido', visible: 'none' }
    ];
  }

  btnDelete_onClick(idPedido) {
    this.sweetalertService.dialogo("", `Tem certeza que deseja excluir o pedido? ${idPedido}`).subscribe(result => {
      if (!result) {
        return;
      }
      else {
        this.prepedidoRemoverService.remover(idPedido).toPromise().then(r => {
          this.lstDtoFiltrada.forEach((x, i) => {
            if (x.NumPedido == idPedido) {
              this.lstDtoFiltrada.splice(i, 1);
            }
          });

          window.location.reload();
        }).catch(e => this.alertaService.mostrarErroInternet("Falha ao excluir!"));
      }
    });
  }

  pesquisaAuto() {
    let url = sessionStorage.getItem("urlAnterior");
    if (!!url && (url.indexOf("orcamentos/aprovar-orcamento") > -1 || url.indexOf("prepedido/detalhes/") > -1 || url.indexOf("pedido/detalhes/") > -1)) {
      let json = sessionStorage.getItem("filtro");
      this.filtro = JSON.parse(json);

      if (this.filtro.DtInicio) {
        this.dtInicio = new Date(DataUtils.formata_formulario_date(this.filtro.DtInicio.toString()));
      } else this.dtInicio = null;

      if (this.filtro.DtFim) {
        this.dtFim = new Date(DataUtils.formata_formulario_date(this.filtro.DtFim.toString()));
      }
      else this.filtro.DtFim = null;

      if (this.filtro.DtInicioExpiracao) {
        this.dtInicioExpiracao = new Date(DataUtils.formata_formulario_date(this.filtro.DtInicioExpiracao.toString()));
      } else this.dtInicioExpiracao = null;

      if (this.filtro.DtFimExpiracao) {
        this.dtFimExpiracao = new Date(DataUtils.formata_formulario_date(this.filtro.DtFimExpiracao.toString()));
      }
      else this.dtFimExpiracao = null;

      if (this.filtro.Parceiros && this.filtro.Parceiros.length > 0) {
        this.carregandoVendedoresParceiros = true;

        this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorParceiros(this.filtro.Parceiros).toPromise().then((r) => {
          if (r != null) {
            r.forEach(x => {
              if (!!x.nome) {
                if (!this.cboVendedoresParceiros.find(f => f.Value == x.nome))
                  this.cboVendedoresParceiros.push({ Id: x.id, Value: x.nome });
              }
            });
            this.carregandoVendedoresParceiros = false;
            this.VendedorParceiros = this.filtro.VendedorParceiros;
          }
        }).catch((e) => {
          this.sweetAlertService.aviso(e.error.Mensagem);
          this.carregandoVendedoresParceiros = false;
        });
        // this.buscarVendedoresDoParceiro(this.filtro.Parceiros);
      }

      if (!this.filtro.pagina || this.filtro.pagina == 0)
        this.filtro.pagina = 0;

      this.cdr.detectChanges();
      this.filtro.idBaseBusca = null;
      this.buscarLista(this.filtro);
    }
    else {
      this.pesquisar();
    }
  }

  pesquisar() {
    this.filtro.pagina = 0;
    this.first = 0;
    this.setarFiltro();
    this.filtro.idBaseBusca = null;
    this.buscarLista(this.filtro);
  }

  setarFiltro() {

    if (this.dtInicio) {
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(this.dtInicio));
    } else this.filtro.DtInicio = null;

    if (this.dtFim) {
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtFim));
    }
    else this.filtro.DtFim = null;

    if (this.dtInicioExpiracao) {
      this.filtro.DtInicioExpiracao = DataUtils.formataParaFormulario(new Date(this.dtInicioExpiracao));
    } else this.filtro.DtInicioExpiracao = null;

    if (this.dtFimExpiracao) {
      this.filtro.DtFimExpiracao = DataUtils.formataParaFormulario(new Date(this.dtFimExpiracao));
    }
    else this.filtro.DtFimExpiracao = null;

    this.filtro.Origem = this.parametro;

    if (this.autenticacaoService._tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      this.filtro.Loja = this.autenticacaoService._lojaLogado;
    }
    this.filtro.pagina = 0;
    // this.filtro.qtdeItensPagina = this.qtdePorPaginaInicial;
    if (this.parametro == "ORCAMENTOS") this.filtro.nomeColunaOrdenacao = this.cols[0].field;
    if (this.parametro == "PENDENTES") this.filtro.nomeColunaOrdenacao = this.cols[1].field;

    if (this.tipoUsuario == this.constantes.GESTOR || this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {

      this.filtroParceirosApoio = this.filtro.Parceiros;
      let filtroParceiro = this.filtro.Parceiros;
      this.filtro.Parceiros = new Array();
      if (filtroParceiro) {
        filtroParceiro.forEach(x => {
          if (x == this.constantes.SEM_INDICADOR) {
            if (this.parametro == "PENDENTES") x = "";
            else x = "-";
          }

          this.filtro.Parceiros.push(x);
        });
      }
    }

    this.filtro.VendedorParceiros = this.VendedorParceiros;
    this.filtro.ordenacaoAscendente = false;
    this.filtro.Exportar = false;
    this.filtro.pagina = 0;
    this.first = 0;
  }

  buscarRegistros(event: LazyLoadEvent) {
    if (this.lstDtoFiltrada.length > 0) {
      this.setarFiltro();

      this.filtro.pagina = event.first / event.rows;
      this.filtro.qtdeItensPagina = event.rows;
      if (!!event.sortField) {
        this.filtro.nomeColunaOrdenacao = event.sortField;
        this.filtro.ordenacaoAscendente = event.sortOrder > 0 ? true : false;
      } else {
        this.filtro.ordenacaoAscendente = false;
      }

      if (this.filtro.idBaseBusca == null && this.parametro == "ORCAMENTOS")
        this.filtro.idBaseBusca = this.lstDtoFiltrada[0].NumeroOrcamento;
      if (this.filtro.idBaseBusca == null && this.parametro == "PENDENTES")
        this.filtro.idBaseBusca = this.lstDtoFiltrada[0].NumPedido;
      if (this.filtro.idBaseBusca == null && this.parametro == "PEDIDOS")
        this.filtro.idBaseBusca = this.lstDtoFiltrada[0].NumPedido;

      this.buscarLista(this.filtro);
    }
  }

  buscarLista(filtro: Filtro) {

    this.carregando = true;

    this.lstDto = new Array();
    this.lstDtoFiltrada = new Array();

    sessionStorage.setItem("filtro", JSON.stringify(filtro));

    this.orcamentoService.buscarRegistros(filtro).toPromise().then((r) => {

      if (!r.Sucesso) {
        this.mostrarQtdePorPagina = false;
        this.sweetAlertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }

      this.lstDto = r.orcamentoCotacaoListaDto;
      this.qtdeRegistros = r.qtdeRegistros;
      this.carregando = false;
      this.mostrarQtdePorPagina = true;
      // if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) {
      //   this.first = 0;
      //   this.qtdePorPaginaInicial = this.qtdePorPaginaSelecionado;
      // }

      if (!!this.filtro.pagina)
        this.first = this.filtro.pagina * this.filtro.qtdeItensPagina;

      this.lstDtoFiltrada = this.lstDto;
      // this.filtro.Parceiros = this.filtroParceirosApoio;
    }).catch((r) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(r);
    });
  }

  montarLinhaBusca() {
    this.lstDto.forEach(x => {
      x.linhaBusca = x.NumeroOrcamento + "/" + x.NumPedido.toLowerCase();
      x.linhaBusca += "/" + x.Cliente_Obra.toLowerCase() + "/";
    });
  }

  exportXlsx() {
    this.montarListaParaExport(true);
  }

  exportCsv() {
    this.montarListaParaExport(false);
  }

  montarListaParaExport(excel: boolean) {
    let lstExport = new Array<ListaDtoExport>();

    this.filtro.Exportar = true;

    this.orcamentoService.buscarRegistros(this.filtro).toPromise().then((r) => {

      if (!r.Sucesso) {
        this.mostrarQtdePorPagina = false;
        this.sweetAlertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }

      r.orcamentoCotacaoListaDto.forEach(l => {

        let linha = new ListaDtoExport();
        linha.NumeroOrcamento = l.NumeroOrcamento;
        if (this.parametro != enumParametros.ORCAMENTOS) linha.NumPedido = l.NumPedido;
        linha.Cliente = l.Cliente_Obra;
        linha.Vendedor = l.Vendedor;
        linha.Parceiro = l.Parceiro;
        linha.VendedorParceiro = l.VendedorParceiro;
        if (this.parametro != enumParametros.ORCAMENTOS) linha.Valor = this.moedaUtils.formatarMoedaComPrefixo(Number(l.Valor));
        linha.Status = l.Status;
        if (this.parametro == enumParametros.ORCAMENTOS) linha.DtExpiracao = this.dataUtils.formata_data_DDMMYYY(l.DtExpiracao);
        linha.DtCadastro = this.dataUtils.formata_data_DDMMYYY(l.DtCadastro);

        lstExport.push(linha);
      });

      this.carregando = false;

      if (excel) {
        this.exportExcelService.exportAsXLSXFile(lstExport, "Lista de Orçamentos", false);
      }
      else {
        this.exportExcelService.exportAsCSVFile(lstExport, "Lista de Orçamentos", false);
      }
    }).catch((r) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(r);
    });
  }

  orcamento_OnClick(id) {
    this.visualizando = true;
    sessionStorage.setItem("urlAnterior", "orcamentos/aprovar-orcamento");
    this.router.navigate(["orcamentos/aprovar-orcamento", id]);
  }

  prepedido_OnClick(id) {
    this.prepedidoService.carregar(id).toPromise().then((r) => {
    this.visualizando = true;

      if (!!r.NumeroPedido && r.St_Orc_Virou_Pedido) {
        sessionStorage.setItem("urlAnterior", "pedido/detalhes/");
        this.router.navigate(["pedido/detalhes/", r.NumeroPedido]);
        return;
      }
      sessionStorage.setItem("urlAnterior", "prepedido/detalhes/");
      this.router.navigate(["prepedido/detalhes/", id]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
  }

  pedido_OnClick(id) {
    this.visualizando = true;
    sessionStorage.setItem("urlAnterior", "pedido/detalhes/");
    this.router.navigate(["pedido/detalhes/", id]);
  }

  filtrarVendedores(event) {
    let filtrado: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.cboVendedores.length; i++) {
      let vende = this.cboVendedores[i];
      if (vende.Value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(vende);
      }
    }

    this.cboFiltradoVendedores = filtrado;
  }

  ngOnDestroy() {
    if (!this.visualizando) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
  }
}