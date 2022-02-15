import { MoedaUtils } from './../../utilities/formatarString/moeda-utils';
import { Usuario } from './../../dto/usuarios/usuario';
import { OrcamentistaIndicadorDto } from './../../dto/orcamentista-indicador/orcamentista-indicador';
import { ListaDto, ListaDtoExport } from './../../dto/orcamentos/lista-dto';
import { Filtro } from './../../dto/orcamentos/filtro';
import { AlertaService } from './../../utilities/alert-dialog/alerta.service';
import { ExportExcelService } from './../../service/export-files/export-excel.service';
import { ParceiroService } from './../../service/parceiro/parceiro.service';
import { UsuariosService } from './../../service/usuarios/usuarios.service';
import { MensagemService } from './../../utilities/mensagem/mensagem.service';
import { PedidosService } from './../../service/pedidos/pedidos.service';
import { OrcamentosService } from './../orcamentos.service';
import { AutenticacaoService } from './../../service/autenticacao/autenticacao.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { enumParametros } from '../enumParametros';
import { OrcamentoCotacaoStatus } from '../models/OrcamentoCotacaoStatus';
import { DropDownItem } from '../models/DropDownItem';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class OrcamentosListarComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private readonly orcamentoService: OrcamentosService,
    public readonly pedidoService: PedidosService,
    private readonly mensagemService: MensagemService,
    private readonly usuarioService: UsuariosService,
    private readonly parceiroService: ParceiroService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,) {
  }

  // @ViewChild('dataTable') table: Table;
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
  lstVendedoresParceiros: Array<any>;
  //lstMensagens: Array<string> = [{Id: '1', Value: 'Sim'},{Id: '0', Value: 'Não'}];

  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboMensagens: Array<DropDownItem> = [];
  cboDatas: Array<DropDownItem> = [];
  idValuesTmp = 0;

  nome_numero: string;
  moedaUtils: MoedaUtils = new MoedaUtils();
  parametro: string;
  lojaLogada: string = "201"; //this.autenticacaoService._lojaLogado;

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.buscarRegistros();

    console.log(this.autenticacaoService._usuarioLogado);
    console.log(this.autenticacaoService._lojasUsuarioLogado);
    console.log(this.autenticacaoService._permissoes);
    console.log(this.autenticacaoService._parceiro);
    console.log(this.autenticacaoService._vendedor);
    console.log(this.autenticacaoService._lojaLogado);
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
      filtroStatus: ['']
    });
  }

  criarTabela() {
    this.activatedRoute.params.subscribe((param: any) => { 
      this.parametro = param.filtro.toUpperCase();
        this.cols = [
          { field: 'NumOrcamento', header: 'Orçamento' },
          { field: 'NumPedido', header: 'Pedido', visible: (this.parametro == enumParametros.ORCAMENTOS ? 'none' : ' ') },
          { field: 'Cliente_Obra', header: 'Cliente / Obra' },
          { field: 'Vendedor', header: 'Vendedor' },
          { field: 'Parceiro', header: 'Parceiro' },
          { field: 'VendedorParceiro', header: 'Vendedor Parceiro' },
          { field: 'Valor', header: 'Valor' },
          { field: 'Status', header: 'Status' },
          { field: 'VistoEm', header: 'Visto em:' },
          { field: 'Mensagem', header: 'Pendente' },
          { field: "Editar", header: " ", visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
          { field: "DtCadastro", header: "Cadastro", visible: 'none' }
        ];
    });
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();

    if(this.parametro == enumParametros.PENDENTES) {
      //this.form.controls.status.setValue(7);
    }
  }

  buscarRegistros() {
      this.orcamentoService.buscarRegistros(this.parametro, this.lojaLogada).toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;

          this.popularTela();
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  popularTela() {
    this.buscarStatus();
    this.buscarVendedores();
    this.buscarParceiros();
    this.buscarVendedoresParceiros();
    this.buscarMensagens();
  }
  
  buscarStatus() {
    this.cboStatus = [];
    this.lstDto.forEach(x => {
      if(!this.cboStatus.find(f=> f.Value == x.Status)) {
        if(x.Status) {
          this.cboStatus.push({ Id:(this.idValuesTmp++).toString(), Value:x.Status});
        }
      }
    });
  }

  buscarVendedores() {
    this.cboVendedores = [];
    this.lstDto.forEach(x => {
      if(!this.cboVendedores.find(f=> f.Value == x.Vendedor)) {
        if(x.Vendedor) {
          this.cboVendedores.push({ Id:(this.idValuesTmp++).toString(), Value:x.Vendedor});
        }
      }
    });
  }
  
  buscarParceiros() {
    this.cboParceiros = [];
    this.lstDto.forEach(x => {
      if(!this.cboParceiros.find(f=> f.Value == x.Parceiro)) {
        if(x.Parceiro) {
          this.cboParceiros.push({ Id:(this.idValuesTmp++).toString(), Value:x.Parceiro});
        }
      }
    });    
  }

  buscarVendedoresParceiros() {
    this.cboVendedoresParceiros = [];
    this.lstDto.forEach(x => {
      if(!this.cboVendedoresParceiros.find(f=> f.Value == x.VendedorParceiro)) {
        if(x.VendedorParceiro) {
          this.cboVendedoresParceiros.push({ Id:(this.idValuesTmp++).toString(), Value:x.VendedorParceiro});
        }
      }
    });     
  }
  
  buscarMensagens() {
    this.cboMensagens = [];
    this.lstDto.forEach(x => {
      if(!this.cboMensagens.find(f=> f.Value == x.Mensagem)) {
        this.cboMensagens.push({ Id:(this.idValuesTmp++).toString(), Value:x.Mensagem});
      }
    });     
    this.buscarDatas();
  }

  buscarDatas() {
    this.cboDatas = [];
    this.lstDto.forEach(x => {
      if(!this.cboDatas.find(f=> (new Date(f.Value)) >= this.filtro.DtInicio && (new Date(f.Value) <= this.filtro.DtFim))) {
        this.cboDatas.push({ Id:(this.idValuesTmp++).toString(), Value:x.DtCadastro.toString()});
      }
    });  
  }

  Pesquisar_Click() {
    console.log('#####################################################');
    console.log('filtrar INI: ' + this.lstDtoFiltrada.length);
    let lstFiltroStatus: Array<ListaDto> = new Array();
    let lstFiltroMensagem: Array<ListaDto> = new Array();
    let lstFiltroDatas: Array<ListaDto> = new Array();
    this.lstDtoFiltrada = new Array();

    let lstFiltroVendedor = this.lstDto.filter(s => this.filtro.Vendedor == s.Vendedor); 
    let lstFiltroParceiro = this.lstDto.filter(s => this.filtro.Parceiro == s.Parceiro); 
    let lstFiltroParcVend = this.lstDto.filter(s => this.filtro.VendedorParceiro == s.VendedorParceiro); 
    if(this.filtro.Status)   { lstFiltroStatus = this.lstDto.filter(s => this.filtro.Status.includes(s.Status)); }
    if(this.filtro.Mensagem) { lstFiltroMensagem = this.lstDto.filter(s => this.filtro.Mensagem == s.Mensagem) }; 
    if(this.filtro.DtInicio && this.filtro.DtFim) { lstFiltroDatas = this.lstDto.filter(s => (new Date(s.DtCadastro)) >= this.filtro.DtInicio && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }; 

    console.log('Status:   ' + this.filtro.Status);
    console.log('Vendedor: ' + this.filtro.Vendedor);
    console.log('Parceiro: ' + this.filtro.Parceiro);
    console.log('VendParc: ' + this.filtro.VendedorParceiro);
    console.log('Mensagem: ' + this.filtro.Mensagem);
    console.log('Data Ini: ' + this.filtro.DtInicio);
    console.log('Data Fim: ' + this.filtro.DtFim);

    if( (this.filtro.Status === undefined || this.filtro.Status == null)
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
      if(lstFiltroStatus.length   > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.Status.includes(x.Status)); }
      if(lstFiltroVendedor.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.Vendedor == x.Vendedor); }
      if(lstFiltroParceiro.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.Parceiro == x.Parceiro); }
      if(lstFiltroParcVend.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.VendedorParceiro == x.VendedorParceiro); }
      if(lstFiltroMensagem.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.Mensagem == x.Mensagem); }
      if(lstFiltroDatas.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(s => (new Date(s.DtCadastro) >= this.filtro.DtInicio) && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }
    }

    console.log('Status  .length: ' + lstFiltroStatus.length);
    console.log('Vendedor.length: ' + lstFiltroVendedor.length);
    console.log('Parceiro.length: ' + lstFiltroParceiro.length);
    console.log('ParcVend.length: ' + lstFiltroParcVend.length);
    console.log('Mensagem.length: ' + lstFiltroMensagem.length);
    console.log('Datas   .length: ' + lstFiltroDatas.length);
    console.log('filtrar FIM: ' + this.lstDtoFiltrada.length);
    console.log('#####################################################');

    this.popularTela();
  }

  Parceiro_onChange(event) {
  //   this.buscarVendedoresParceiros(event.value);
  //   // this.buscarVendedoresParceiros("");
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

      // linha.Data = l.Data;
      // linha.Numero = l.Nome;
      // linha.Nome = l.Nome;
      // linha.Status = l.Status;
      // linha.Valor = this.moedaUtils.formatarMoedaComPrefixo(l.Valor);

      lstExport.push(linha);
    });

    return lstExport;
  }
}

