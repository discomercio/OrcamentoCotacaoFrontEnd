import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';

import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { ListaDto, ListaDtoExport } from 'src/app/dto/orcamentos/lista-dto';
import { OrcamentosService } from 'src/app/orcamentos/orcamentos.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isDate } from 'util';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { PedidosService } from 'src/app/service/pedidos/pedidos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
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
    private readonly lojaService: LojasService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,) {
  }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  inscricao: Subscription;
  param: string;
  selectedFiltros: SelectItem;
  lstFiltro: SelectItem[];
  filtro: Filtro = new Filtro();
  emPedidos: boolean = false;
  cols: any[];
  lstDto: Array<ListaDto> = new Array();
  lstDtoFiltrada: Array<ListaDto> = new Array();
  moedaUtils: MoedaUtils = new MoedaUtils();
  lstParceiro: Array<OrcamentistaIndicadorDto>;
  parceiroSelecionado: OrcamentistaIndicadorDto;
  lstParceiroFiltrado: Array<OrcamentistaIndicadorDto>;
  lstLoja: Array<Lojas>;
  lstStatus: Array<OrcamentoCotacaoStatus>;
  statusSelecionado: Array<OrcamentoCotacaoStatus>;
  lojaSelecionada: Lojas;
  lstLojaFiltrada: Array<Lojas>;
  lstVendedores: Array<Usuario>;
  vendedorSelecionado: Usuario;
  lstVendedoresFiltrado: Array<Usuario>;
  nome_numero: string;
  vendedorParceiroSelecionado: any;
  lstVendedoresParceiroFiltrado: Array<any>;
  parametro: string;
  msgPendenteArray: Array<DropDownItem>;
  msgPendenteSelecionada: string;

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.buscarStatus();
    this.buscarVendedores();
    this.buscarParceiros();
    this.buscarRegistros();

    this.msgPendenteArray = [
      {Id: '1', Value: 'Sim'},
      {Id: '0', Value: 'Não'},
    ];
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
          { field: 'ParceiroVendedor', header: 'Vendedor Parceiro' },
          { field: 'Valor', header: 'Valor' },
          { field: 'Status', header: 'Status' },
          { field: 'VistoEm', header: 'Visto em:' },
          { field: 'Pendente', header: 'Pendente' },
          { field: "Editar", header: " ", visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') }
        ];
    });
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();

    if(this.parametro == enumParametros.PENDENTES) {
      //this.form.controls.status.setValue(7);
    }
  }

  setarFiltro() {
    let filtro = this.param;
    this.filtro.Status = new Array<string>();
    this.lstFiltro.map((m) => {
      let map: string = m.value.toLowerCase();
      if (map.indexOf(filtro) > -1) {
        this.filtro.Status.push(m.value);
      }
    });
  }

  buscarStatus() {
    this.orcamentoService.buscarStatus(this.parametro).toPromise().then((r) => {
      if (r != null) {
        this.lstStatus = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
    // if (this.parametro == enumParametros.ORCAMENTOS) {
    //   this.lstFiltro = [
    //     { label: "Em espera", value: "Em espera" },
    //     { label: "A entregar", value: "A entregar" },
    //     { label: "Entregue", value: "Entregue" },
    //     { label: "Split possível", value: "Split possível" },
    //     { label: "Separar mercadoria", value: "Separar mercadoria" },
    //     { label: "Cancelado", value: "Cancelado" }
    //   ];
    // } else if (this.parametro == enumParametros.PEDIDOS) {
    //   this.lstFiltro = [
    //     { label: "Expirado", value: "Expirado" },
    //     { label: "Virou pedido", value: "Virou pedido" },
    //     { label: "Encerrado (Cancelado)", value: "Encerrado (Cancelado)" },
    //     { label: "Pendente de aprovação do cliente", value: "Pendente de aprovação do cliente" },
    //     { label: "Pendente de aprovação de desconto", value: "Pendente de aprovação de desconto" },
    //     { label: "Pendente de revisão de dados", value: "Pendente de revisão de dados" },
    //     { label: "Desconto negado", value: "Desconto negado" },
    //     { label: "Desconto aprovado", value: "Desconto aprovado" }
    //   ]
    // }
  }

  buscarRegistros() {
      this.orcamentoService.buscarRegistros(this.parametro).toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceiros() {
    // this.usuarioService.buscarParceiros().toPromise().then((r) => {
    //   if (r != null) {
    //     this.lstParceiro = r;
    //   }
    // }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

  // buscarLojas() {
  //   this.lojaService.buscarTodasLojas().toPromise().then((r) => {
  //     if (r != null) {
  //       this.lstLoja = r;
  //     }
  //   }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  // }

  buscarVendedores() {
    //autenticacaoService.
    this.usuarioService.buscarVendedores("200").toPromise().then((r) => {
      console.log(r);
      if (r != null) {
        this.lstVendedores = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedoresParceiros() {
    //TODO: fazer a busca de vendedores de parceiros
  }

  filtrarParceiros(event: any) {
    let query = event.query;
    this.lstParceiroFiltrado = this.lstParceiro;//.filter(r => r.nome.toLowerCase().indexOf(query.toLowerCase()) > -1|| r.nome.toLowerCase().indexOf(query.toLowerCase()) > -1);
  }

  filtrarVendedoresParceiros(event: any) {

  }

  filtrarLojas(event: any) {
    // let query = event.query;
    // this.lstLojaFiltrada = this.lstLoja.filter(r => r.loja.indexOf(query) > -1 //.toLowerCase()
    //   || r.nome.indexOf(query) > -1); //.toLowerCase()
  }

  filtrarVendedores(event: any) {
    let query = event.query;
    this.lstVendedoresFiltrado = this.lstVendedores;//.filter(r => r.usuario.toLowerCase().indexOf(query.toLowerCase()) > -1 && r.loja == "205");
  }

  filtrar(mostrarMensagem: boolean) {
    console.log('filtrar: ' + this.lstDtoFiltrada.length);
    console.log('statusSelecionado: ' + this.statusSelecionado);

    this.lstDtoFiltrada = this.lstDto.filter(s => this.statusSelecionado.toString().includes(s.Status)); 
    
    console.log('filtrar: ' + this.lstDtoFiltrada.length);
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

