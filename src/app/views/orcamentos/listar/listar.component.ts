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
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';
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
    private readonly prepedidoService: PrepedidoService,
    private readonly sweetalertService: SweetalertService
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
  lstVendedores: Array<Usuario>;
  lstParceiros: Array<OrcamentistaIndicadorDto>;
  public linhaSelecionada: ListaDto;

  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
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

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.buscarRegistros();
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();
    this.filtro.DtInicio = this.minDate;
    this.filtro.DtFim = this.maxDate;
  }

  criarForm() {
    this.form = this.fb.group({
      status: [''],
      cliente: [''],
      vendedor: [''],
      parceiro: [''],
      msgPendente: [''],
      dtInicio: [''],
      dtFim: [''],
      filtroStatus: ['']
    });
  }

  criarTabela() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.parametro = param.filtro.toUpperCase();
      this.cols = [
        { field: 'NumeroOrcamento', header: 'Orçamento' },
        { field: 'NumPedido', header: 'Pedido', visible: (this.parametro == enumParametros.ORCAMENTOS ? 'none' : ' ') },
        { field: 'Cliente_Obra', header: 'Cliente' },
        { field: 'Vendedor', header: 'Vendedor' },
        { field: 'Parceiro', header: 'Parceiro' },
        { field: 'Valor', header: 'Valor', visible: (this.parametro == enumParametros.ORCAMENTOS ? 'none' : '') },
        { field: 'Status', header: 'Status' },
        { field: 'Mensagem', header: 'Msg. Pendente', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
        { field: 'DtExpiracao', header: 'Expiração', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
        { field: 'DtCadastro', header: 'Data' },
        { field: 'Editar', header: " ", visible: 'none' },
        { field: 'St_Orc_Virou_Pedido', header: 'St_Orc_Virou_Pedido', visible: 'none' },
      ];
    });
  }

  btnDelete_onClick(idPedido) {
    this.sweetalertService.confirmarExclusao(`Tem certeza que deseja excluir o pedido? ${idPedido}`, "").subscribe(result => {
      if (!result) {
        return;
      }
      else {
        this.prepedidoService.removerPrePedido(idPedido).toPromise().then(r => {
          this.lstDtoFiltrada.forEach((x, i) => {
            if (x.NumPedido == idPedido) {
              this.lstDtoFiltrada.splice(i, 1);
            }
          });
          this.popularTela();
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
      if (r != null) {
        this.lstDto = r;
        this.montarLinhaBusca();
        this.lstDtoFiltrada = this.lstDto;
        this.popularTela();
        this.carregando = false;
      }
    }).catch((r) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(r);
    });
  }

  montarLinhaBusca() {
    this.lstDto.forEach(x => {
      x.linhaBusca = x.NumeroOrcamento ? x.NumeroOrcamento : x.NumPedido;
      x.linhaBusca +=  "/" + x.Cliente_Obra.toLowerCase() + "/";
    });
  }
  popularTela() {
    this.buscarStatus();
    this.buscarVendedores();
    this.buscarParceiros();
    this.buscarMensagens();
  }

  buscarStatus() {
    this.cboStatus = [];
    this.lstDto.forEach(x => {
      if (!this.cboStatus.find(f => f.Value == x.Status)) {
        if (x.Status) {
          this.cboStatus.push({ Id: (this.idValuesTmp++).toString(), Value: x.Status });
        }
      }
    });
  }

  buscarVendedores() {
    this.cboVendedores = [];
    this.lstDto.forEach(x => {
      if (!this.cboVendedores.find(f => f.Value == x.Vendedor)) {
        if (x.Vendedor) {
          this.cboVendedores.push({ Id: (this.idValuesTmp++).toString(), Value: x.Vendedor });
        }
      }
    });
  }

  buscarParceiros() {
    this.cboParceiros = [];
    this.lstDto.forEach(x => {
      if (!this.cboParceiros.find(f => f.Value == x.Parceiro)) {
        if (x.Parceiro) {
          this.cboParceiros.push({ Id: (this.idValuesTmp++).toString(), Value: x.Parceiro });
        }
      }
    });
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
    debugger;
    // console.log('#####################################################');
    // console.log('filtrar INI: ' + this.lstDtoFiltrada.length);
    let lstFiltroStatus: Array<ListaDto> = new Array();
    let lstFiltroMensagem: Array<ListaDto> = new Array();
    let lstFiltroDatas: Array<ListaDto> = new Array();
    this.lstDtoFiltrada = new Array();

    let lstFiltroVendedor = this.lstDto.filter(s => this.filtro.Vendedor == s.Vendedor);
    let lstFiltroParceiro = this.lstDto.filter(s => this.filtro.Parceiro == s.Parceiro);
    if (this.filtro.Status) { lstFiltroStatus = this.lstDto.filter(s => this.filtro.Status.includes(s.Status)); }
    if (this.filtro.Mensagem) { lstFiltroMensagem = this.lstDto.filter(s => this.filtro.Mensagem == s.Mensagem) };
    if (this.filtro.DtInicio && this.filtro.DtFim) { lstFiltroDatas = this.lstDto.filter(s => (new Date(s.DtCadastro)) >= this.filtro.DtInicio && (new Date(s.DtCadastro) <= this.filtro.DtFim)); };

    // console.log('Status:   ' + this.filtro.Status);
    // console.log('Vendedor: ' + this.filtro.Vendedor);
    // console.log('Parceiro: ' + this.filtro.Parceiro);
    // console.log('Mensagem: ' + this.filtro.Mensagem);
    // console.log('Data Ini: ' + this.filtro.DtInicio);
    // console.log('Data Fim: ' + this.filtro.DtFim);

    if ((this.filtro.Status === undefined || this.filtro.Status == null)
      && (this.filtro.Vendedor === undefined || this.filtro.Vendedor == null)
      && (this.filtro.Parceiro === undefined || this.filtro.Parceiro == null)
      && (this.filtro.Mensagem === undefined || this.filtro.Mensagem == null)
      && (this.filtro.DtInicio === undefined || this.filtro.DtInicio == null)
      && (this.filtro.DtFim === undefined || this.filtro.DtFim == null)
    ) {
      this.lstDtoFiltrada = this.lstDto;
    } else {
      this.lstDtoFiltrada = this.lstDto;
      if (this.filtro.Nome_numero) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => x.linhaBusca.includes(this.filtro.Nome_numero.toLowerCase())); };
      if (lstFiltroStatus.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Status.includes(x.Status)); }
      if (lstFiltroVendedor.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Vendedor == x.Vendedor); }
      if (lstFiltroParceiro.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Parceiro == x.Parceiro); }
      if (lstFiltroMensagem.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x => this.filtro.Mensagem == x.Mensagem); }
      if (lstFiltroDatas.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(s => (new Date(s.DtCadastro) >= this.filtro.DtInicio) && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }
    }

    // console.log('Status  .length: ' + lstFiltroStatus.length);
    // console.log('Vendedor.length: ' + lstFiltroVendedor.length);
    // console.log('Parceiro.length: ' + lstFiltroParceiro.length);
    // console.log('Mensagem.length: ' + lstFiltroMensagem.length);
    // console.log('Datas   .length: ' + lstFiltroDatas.length);
    // console.log('filtrar FIM: ' + this.lstDtoFiltrada.length);
    // console.log('#####################################################');

    this.popularTela();
  }

  cboStatus_onChange(event) {
    this.Pesquisar_Click();
  }

  cboVendedor_onChange(event) {
    this.Pesquisar_Click();
  }

  cboParceiro_onChange(event) {
    this.Pesquisar_Click();
  }

  cbMensagens_onChange(event) {
    this.Pesquisar_Click();
  }

  dtInicio_onBlur(event) {
    // console.log('dtInicio_onChange');
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

  dtInicio_onSelect() {
    this.Pesquisar_Click();
  }

  dtFim_onBlur(event) {
    // console.log('dtInicio_onChange');
    var dtini = new Date(this.form.controls.dtInicio.value);
    var dtfim = new Date(this.form.controls.dtFim.value);

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
      if (this.parametro != enumParametros.ORCAMENTOS) linha.Valor = this.moedaUtils.formatarMoedaComPrefixo(Number(l.Valor));
      linha.Status = l.Status;
      linha.DtCadastro = this.dataUtils.formata_data_DDMMYYY(l.DtCadastro);

      lstExport.push(linha);
    });

    return lstExport;
  }

}



