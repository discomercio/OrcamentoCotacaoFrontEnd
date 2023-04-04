import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    private readonly mensagemService: MensagemService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly prepedidoRemoverService: PrepedidoRemoverService,
    private readonly sweetalertService: SweetalertService,
    private readonly sweetAlertService: SweetalertService,
    private readonly usuarioService: UsuariosService,
    private readonly pedidoService: PedidoService
  ) {
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

  d = new Date();
  qtdDiasDtIni: number = 60;
  minDate = new Date(this.d.setDate(this.d.getDate() - this.qtdDiasDtIni));
  maxDate = new Date();

  first: number = 0;
  public constantes: Constantes = new Constantes();
  usuario = new Usuario();
  public lstVendedores: SelectItem[] = [];
  public lstVendedoresParceiros: SelectItem[] = [];
  public lstParceiro: SelectItem[] = [];
  tipoUsuario: number;
  admModulo: boolean;
  vendedorSelecionado: DropDownItem;
  configValidade: ValidadeOrcamento;

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.setarCamposDoForm();
    this.buscarVendedores();
    this.buscarConfigValidade();

  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();
    this.filtro.DtInicio = this.minDate;
    this.filtro.DtFim = this.maxDate;

    if (this.parametro == "MSGPENDENTES") {
      this.parametro = "ORCAMENTOS";
      this.filtro.Mensagem = "Sim";
    }

    this.buscarRegistros();
  }

  minExpiracao = new Date();
  maxEpiracao = new Date();
  iniciarFiltroExpericao() {
    let periodoMaxExpiracao = this.configValidade.MaxPeriodoConsultaFiltroPesquisa;

    let maxItem = this.lstDto.reduce((a, b) => {
      return new Date(a.DtExpiracao) > new Date(b.DtExpiracao) ? a : b;
    });
    let minItem = this.lstDto.reduce((a, b) => {
      return new Date(a.DtExpiracao) < new Date(b.DtExpiracao) ? a : b;
    });
    this.filtro.DtFimExpiracao = new Date(maxItem.DtExpiracao);
    this.filtro.DtInicioExpiracao = new Date(minItem.DtExpiracao);
    this.maxEpiracao = this.filtro.DtFimExpiracao;
    this.minExpiracao = this.filtro.DtInicioExpiracao;
  }

  criarForm() {
    this.form = this.fb.group({
      status: [''],
      cliente: [''],
      vendedor: [''],
      parceiro: [''],
      vendedorParceiro: [''],
      msgPendente: [''],
      dtInicio: [''],
      dtFim: [''],
      filtroStatus: [''],
      dtFimExpiracao: [''],
      dtInicioExpiracao: ['']
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
      this.lstDto.forEach(x => {
        if (!this.cboStatus.find(f => f.Value == x.Status)) {
          if (x.Status) {
            this.cboStatus.push({ Id: (this.idValuesTmp++).toString(), Value: x.Status });
          }
        }
      });
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

  buscarConfigValidade() {
    this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise().then((r) => {
      if (r != null) {
        this.configValidade = r;
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
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
          this.popularTela();
          window.location.reload();
        }).catch(e => this.alertaService.mostrarErroInternet("Falha ao excluir!"));
      }
    });
  }
  carregando: boolean = false;
  buscarRegistros() {
    this.filtro.Origem = this.parametro;
    this.filtro.Loja = this.autenticacaoService._lojaLogado;
    this.carregando = true;
    this.orcamentoService.buscarRegistros(this.filtro).toPromise().then((r) => {
      if (r != null && r.length > 0) {
        this.lstDto = r;
        this.montarLinhaBusca();
        this.lstDto.forEach(x => {
          let dataExpiracao = new Date(new Date(x.DtExpiracao).getFullYear(), new Date(x.DtExpiracao).getMonth(), new Date(x.DtExpiracao).getDate());
          let dataAtual = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
          if (x.IdStatus == 1 && dataExpiracao < dataAtual) {
            x.IdStatus = 4;
            x.Status = "Expirado";
          }
        });
        this.lstDtoFiltrada = this.lstDto;
        if (this.parametro == "ORCAMENTOS") {
          this.iniciarFiltroExpericao();
        }
        this.Pesquisar_Click();
        this.carregando = false;
        return;
      }
      this.carregando = false;
      this.Pesquisar_Click();
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

  popularTela() {
    this.setarPaginacao();
    if (this.cboStatus.length == 0) this.buscarStatus();
    this.filtrar_cboVendedoresParceiro();
    this.filtrar_cboParceiros();
    this.buscarMensagens();
  }

  setarPaginacao() {
    this.first = 0;
  }

  filtrar_cboParceiros() {
    this.cboParceiros = [];
    let lstFiltrada = this.lstDto;

    if (lstFiltrada.length > 0) {
      lstFiltrada.forEach(x => {

        if (!!x.Parceiro) {
          if (!this.cboParceiros.find(f => f.Value == x.Parceiro))
            this.cboParceiros.push({ Id: (this.idValuesTmp++).toString(), Value: x.Parceiro });
        }
      });
    }

    this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
  }

  filtrar_cboVendedoresParceiro() {

    let lstFiltrada = this.lstDto.filter(x => x.Parceiro == this.filtro.Parceiro);
    if (lstFiltrada.length > 0) {
      this.cboVendedoresParceiros = new Array<DropDownItem>();
      lstFiltrada.forEach(x => {
        if (x.VendedorParceiro != null) {
          if (!this.cboVendedoresParceiros.find(f => f.Value == x.VendedorParceiro))
            this.cboVendedoresParceiros.push({ Id: x.IdIndicadorVendedor.toString(), Value: x.VendedorParceiro });
        }
      });
      this.cboVendedoresParceiros = this.cboVendedoresParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
    }
    if (this.cboVendedoresParceiros && this.cboVendedoresParceiros.length == 0) this.cboVendedoresParceiros = null;
  }

  buscarMensagens() {
    this.cboMensagens = [];
    this.lstDto.forEach(x => {
      if (!this.cboMensagens.find(f => f.Value == x.Mensagem)) {
        this.cboMensagens.push({ Id: (this.idValuesTmp++).toString(), Value: x.Mensagem });
      }
    });
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

  Pesquisar_Click() {

    let lstFiltroStatus: Array<ListaDto> = new Array();
    let lstFiltroMensagem: Array<ListaDto> = new Array();
    let lstFiltroDatas: Array<ListaDto> = new Array();
    let lstFiltraDataExpiracao: Array<ListaDto> = new Array();
    this.lstDtoFiltrada = new Array();
    let lstFiltroVendedor = new Array<ListaDto>();
    let lstFiltroParceiro = new Array<ListaDto>();

    lstFiltroParceiro = this.lstDto.filter(s => this.filtro.Parceiro == s.Parceiro);

    if (this.filtro.Status) { lstFiltroStatus = this.lstDto.filter(s => this.filtro.Status.includes(s.Status)); }

    if (this.filtro.Mensagem) { lstFiltroMensagem = this.lstDto.filter(s => this.filtro.Mensagem == s.Mensagem) };
    if (this.filtro.DtInicio && this.filtro.DtFim) { lstFiltroDatas = this.lstDto.filter(s => (new Date(s.DtCadastro)) >= this.filtro.DtInicio && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }

    if (this.filtro.DtInicioExpiracao && this.filtro.DtFimExpiracao) {
      let inicio = new Date(this.filtro.DtInicioExpiracao.getFullYear(), this.filtro.DtInicioExpiracao.getMonth(), this.filtro.DtInicioExpiracao.getDate());
      let fim = new Date(this.filtro.DtFimExpiracao.getFullYear(), this.filtro.DtFimExpiracao.getMonth(), this.filtro.DtFimExpiracao.getDate());
      lstFiltraDataExpiracao = this.lstDto.filter(x =>
      (new Date(new Date(x.DtExpiracao).getFullYear(), new Date(x.DtExpiracao).getMonth(), new Date(x.DtExpiracao).getDate()) >= inicio &&
        new Date(new Date(x.DtExpiracao).getFullYear(), new Date(x.DtExpiracao).getMonth(), new Date(x.DtExpiracao).getDate()) <= fim));
    }

    if ((this.filtro.Status === undefined || this.filtro.Status == null)
      && (this.filtro.Vendedor === undefined || this.filtro.Vendedor == null)
      && (this.filtro.Parceiro === undefined || this.filtro.Parceiro == null)
      && (this.filtro.VendedorParceiro === undefined || this.filtro.VendedorParceiro == null)
      && (this.filtro.Mensagem === undefined || this.filtro.Mensagem == null)
      && (this.filtro.DtInicio === undefined || this.filtro.DtInicio == null)
      && (this.filtro.DtFim === undefined || this.filtro.DtFim == null)
    ) {
      this.lstDtoFiltrada = this.lstDto;
    } else {

      this.lstDtoFiltrada = this.lstDto;
      if (this.filtro.Nome_numero) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => x.linhaBusca.includes(this.filtro.Nome_numero.toLowerCase())); };
      if (this.filtro.Status && this.filtro.Status.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Status.includes(x.Status)); }
      if (this.filtro.Vendedor) {
        this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Vendedor == x.Vendedor);
      }
      if (lstFiltroParceiro.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Parceiro == x.Parceiro); }
      if (!!this.filtro.IdIndicadorVendedor) this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.IdIndicadorVendedor == x.IdIndicadorVendedor);
      if (lstFiltroMensagem.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Mensagem == x.Mensagem); }
      if (lstFiltroDatas.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(s => (new Date(s.DtCadastro) >= this.filtro.DtInicio) && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }
      if (lstFiltraDataExpiracao.length > 0) {
        let inicio = new Date(this.filtro.DtInicioExpiracao.getFullYear(), this.filtro.DtInicioExpiracao.getMonth(), this.filtro.DtInicioExpiracao.getDate());
        let fim = new Date(this.filtro.DtFimExpiracao.getFullYear(), this.filtro.DtFimExpiracao.getMonth(), this.filtro.DtFimExpiracao.getDate());
        this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x =>
        (new Date(new Date(x.DtExpiracao).getFullYear(), new Date(x.DtExpiracao).getMonth(), new Date(x.DtExpiracao).getDate()) >= inicio &&
          new Date(new Date(x.DtExpiracao).getFullYear(), new Date(x.DtExpiracao).getMonth(), new Date(x.DtExpiracao).getDate()) <= fim));
      }
    }

    this.popularTela();
  }

  cboStatus_onChange(event) {
    this.Pesquisar_Click();
  }

  cboVendedor_onChange(event) {
    if (this.vendedorSelecionado) {
      this.filtro.Vendedor = this.vendedorSelecionado.Value;
    } else {
      this.filtro.Vendedor = null;
      this.vendedorSelecionado = new DropDownItem();
    }
    this.Pesquisar_Click();
  }

  cboParceiro_onChange(event) {
    this.form.controls.vendedorParceiro.setValue(null);
    this.cboVendedoresParceiros = new Array<DropDownItem>();
    this.filtro.IdIndicadorVendedor = null;
    if (!!event.value) this.filtrar_cboVendedoresParceiro();
    this.Pesquisar_Click();
  }

  cboVendedoresParceiro_onChange(event) {
    this.filtro.IdIndicadorVendedor = null;
    if (!!event.value)
      this.filtro.IdIndicadorVendedor = Number.parseInt(event.value);
    this.Pesquisar_Click();
  }

  cbMensagens_onChange(event) {
    this.Pesquisar_Click();
  }
  cbExpirado_onChange() {
    this.Pesquisar_Click();
  }

  dtInicio_onBlur(event) {

    var dtini = new Date(this.form.controls.dtInicio.value);
    var dtfim = new Date(this.form.controls.dtFim.value);

    if (dtini < this.minDate) {
      this.mensagemService.showWarnViaToast(`Não deve ser inferior a ${this.qtdDiasDtIni} dias!`);
      this.filtro.DtInicio = this.minDate;
      return;
    }

    if (dtini > dtfim) {
      this.mensagemService.showWarnViaToast("Não deve ser maior que Data Fim!");
      this.filtro.DtInicio = this.minDate;
      return;
    }

    this.Pesquisar_Click();
  }

  dtInicioExpiracao_onBlur() {
    let dtini = new Date(this.form.controls.dtInicioExpiracao.value);
    let dtfim = new Date(this.form.controls.dtFimExpiracao.value);

    if (dtfim < dtini) {
      this.mensagemService.showWarnViaToast("Não deve ser menor que data Fim da expiração!");
      this.filtro.DtInicioExpiracao = this.minExpiracao;
      return;
    }

    this.Pesquisar_Click();
  }

  dtFimExpiracao_onBlur() {
    let dtini = new Date(this.form.controls.dtInicioExpiracao.value);
    let dtfim = new Date(this.form.controls.dtFimExpiracao.value);

    if (dtfim < dtini) {
      this.mensagemService.showWarnViaToast("Não deve ser menor que data Fim da expiração!");
      this.filtro.DtFimExpiracao = this.maxEpiracao;
      return;
    }

    this.Pesquisar_Click();
  }

  dtInicio_onSelect() {
    this.Pesquisar_Click();
  }



  dtFim_onBlur(event) {
    let dtini = new Date(this.form.controls.dtInicio.value);
    let dtfim = new Date(this.form.controls.dtFim.value);

    if (dtfim > this.maxDate) {
      this.mensagemService.showWarnViaToast("Não deve ser maior que hoje!");
      this.filtro.DtFim = this.maxDate;
      return;
    }

    if (dtfim < dtini) {
      this.mensagemService.showWarnViaToast("Não deve ser menor que data início!");
      this.filtro.DtFim = this.maxDate;
      return;
    }

    this.Pesquisar_Click();
  }

  dtFim_onSelect() {
    this.Pesquisar_Click();
  }

  ngOnDestroy() {
    this.inscricao.unsubscribe();
  }

  exportXlsx() {
    let lstExport = new Array<ListaDtoExport>();
    lstExport = this.montarListaParaExport();
    this.exportExcelService.exportAsXLSXFile(lstExport, "Lista de Orçamentos");
  }

  exportCsv() {
    let lstExport = new Array<ListaDtoExport>();
    lstExport = this.montarListaParaExport();
    this.exportExcelService.exportAsCSVFile(lstExport, "Lista de Orçamentos");
  }

  montarListaParaExport(): ListaDtoExport[] {
    let lstExport = new Array<ListaDtoExport>();

    this.lstDtoFiltrada.forEach(l => {

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

    return lstExport;
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



