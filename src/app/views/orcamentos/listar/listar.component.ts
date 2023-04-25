import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { PrepedidoListarService } from 'src/app/service/prepedido/prepedido-listar.service';
import { PrepedidoRemoverService } from 'src/app/service/prepedido/prepedido-remover.service';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { dateToLocalArray } from '@fullcalendar/core/datelib/marker';
import { PedidoService } from 'src/app/service/pedido/pedido.service';
import { CodigoDescricaoRequest } from 'src/app/dto/codigo-descricao/codigo-descricao-request';
import { LazyLoadEvent } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class OrcamentosListarComponent implements OnInit, AfterViewInit {

  @ViewChild(ButtonArClubeComponent, { static: false })
  button: ButtonArClubeComponent

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly orcamentoService: OrcamentosService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly prepedidoRemoverService: PrepedidoRemoverService,
    private readonly sweetalertService: SweetalertService,
    private readonly sweetAlertService: SweetalertService,
    private readonly usuarioService: UsuariosService,
    private readonly pedidoService: PedidoService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly cdr: ChangeDetectorRef) {
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
  cols: any[];

  lstDto: Array<ListaDto> = new Array();
  lstDtoFiltrada: Array<ListaDto> = new Array();
  lstStatus: Array<OrcamentoCotacaoStatus>;
  lstParceiros: Array<OrcamentistaIndicadorDto>;

  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboFiltradoVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboMensagens: Array<DropDownItem> = [];
  cboDatas: Array<DropDownItem> = [];

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
  carregandoVendedoresParceiros: boolean = false;

  dtInicio: Date;
  dtFim: Date;

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.buscarConfigValidade();

    this.criarTabela();
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.setarCamposDoForm();

    this.buscarStatus();
    this.buscarVendedores();
    this.buscarParceiros();
    this.buscarMensagens();

  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  listaCodigoDescricao: Array<CodigoDescricaoRequest> = new Array<CodigoDescricaoRequest>();

  buscarStatus() {
    this.cboStatus = [];

    if (this.parametro == "ORCAMENTOS") {
      if (this.autenticacaoService._usuarioLogado) {
        this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise().then((r) => {
          if (r != null) {
            r.forEach(e => {
              this.cboStatus.push({ Id: e.Id, Value: e.Value });
            });
            this.cboStatus.push({ Id: 4, Value: "Expirado" });
          }
        }).catch((e) => {
          this.alertaService.mostrarErroInternet(e);
        })
      }
    }
    else if (this.parametro == "PEDIDOS") {
      let filtro: CodigoDescricaoRequest = new CodigoDescricaoRequest();
      filtro.grupo = "Pedido_St_Entrega";
      this.pedidoService.statusPorFiltro(filtro).toPromise().then((r) => {
        if (!r.Sucesso) {
          this.sweetAlertService.aviso(r.Mensagem);
          return;
        }

        r.listaCodigoDescricao.forEach(e => {
          this.cboStatus.push({ Id: e.codigo, Value: e.descricao });
        });
        this.listaCodigoDescricao = r.listaCodigoDescricao;
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
      })
    }
    else {
      this.cboStatus.push({ Id: 1, Value: "Pedido em andamento" });
      this.cboStatus.push({ Id: 2, Value: "Pedido em processamento" });
      this.cboStatus.push({ Id: 3, Value: "Cancelado" });
    }
  }

  buscarVendedores() {
    if (this.admModulo) {
      let request = new UsuariosPorListaLojasRequest();
      request.lojas = [];
      request.lojas.push(this.autenticacaoService._lojaLogado);

      this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise().then((r) => {
        if (!r.Sucesso) {
          this.sweetAlertService.aviso(r.Mensagem);
          return;
        }
        this.cboVendedores = new Array<any>();
        r.usuarios.forEach(x => {
          this.cboVendedores.push({ Id: x.id, Value: x.vendedor });
        });
        this.cboFiltradoVendedores = this.cboVendedores;
      }).catch((e) => {
        this.sweetAlertService.aviso(e.error.Mensagem);
      });
    }

    this.cboVendedores = this.cboVendedores.sort((a, b) => (a.Value < b.Value ? -1 : 1));
  }

  buscarParceiros() {

    this.orcamentistaIndicadorService.buscarParceirosPorLoja(this.autenticacaoService._lojaLogado).toPromise().then((r) => {
      if (r != null) {
        r.forEach(x => {
          if (!!x.nome) {
            if (!this.cboParceiros.find(f => f.Value == x.nome))
              this.cboParceiros.push({ Id: (this.idValuesTmp++).toString(), Value: x.nome });
          }
        });

        this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
      }

    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
    });
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
      }
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
      this.carregandoVendedoresParceiros = false;
    });
  }

  buscarMensagens() {
    this.cboMensagens.push({ Id: 0, Value: "Não" });
    this.cboMensagens.push({ Id: 1, Value: "Sim" });

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

  buscarConfigValidade() {
    this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise().then((r) => {
      if (r != null) {
        this.configValidade = r;

        let dtIni = new Date(Date.now() - this.configValidade.MaxPeriodoConsultaFiltroPesquisa * 24 * 60 * 60 * 1000);
        this.dtInicio = dtIni;
        this.dtFim = new Date();

        this.pesquisar();

      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();

    if (this.parametro == "MSGPENDENTES") {
      this.parametro = "ORCAMENTOS";
      this.filtro.Mensagem = "Sim";
    }
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
      this.filtro.Parceiro = this.usuario.idParceiro;
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

  pesquisar() {
    this.setarFiltro();
    this.buscarLista(this.filtro);
  }

  setarFiltro() {

    if (this.dtInicio){
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(this.dtInicio));
    }else this.filtro.DtInicio = null;
      
    if (this.dtFim){
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtFim));
    }
    else this.filtro.DtFim = null;

    this.filtro.Origem = this.parametro;
    this.filtro.Loja = this.autenticacaoService._lojaLogado;
    this.filtro.pagina = 0;
    this.filtro.qtdeItensPagina = this.qtdePorPaginaInicial;
    this.filtro.nomeColunaOrdenacao = this.cols[0].field;
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
      this.qtdePorPaginaSelecionado = event.rows;
      this.filtro.nomeColunaOrdenacao = event.sortField;
      this.filtro.ordenacaoAscendente = event.sortOrder > 0 ? true : false;

      if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) {
        this.filtro.pagina = 0;
      }
      this.buscarLista(this.filtro);
    }
  }

  carregando: boolean = false;

  buscarLista(filtro: Filtro) {

    this.carregando = true;

    this.lstDto = new Array();
    this.lstDtoFiltrada = new Array();

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
      if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) {
        this.first = 0;
        this.qtdePorPaginaInicial = this.qtdePorPaginaSelecionado;
      }

      this.lstDtoFiltrada = this.lstDto;
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

  ngOnDestroy() {
    this.inscricao.unsubscribe();
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
        this.exportExcelService.exportAsXLSXFile(lstExport, "Lista de Orçamentos");
      }
      else {
        this.exportExcelService.exportAsCSVFile(lstExport, "Lista de Orçamentos");
      }
    }).catch((r) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(r);
    });
  }

  orcamento_OnClick(id) {
    this.router.navigate(["orcamentos/aprovar-orcamento", id]);
  }

  prepedido_OnClick(id) {
    this.router.navigate(["prepedido/detalhes/", id]);
  }

  pedido_OnClick(id) {
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
}