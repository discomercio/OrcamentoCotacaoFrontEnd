import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { ListaDto, ListaDtoExport } from 'src/app/dto/orcamentos/lista-dto';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isDate } from 'util';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { PedidosService } from 'src/app/service/pedidos/pedidos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute,
    public readonly orcamentoService: OrcamentosService,
    public readonly pedidoService: PedidosService,
    private fb: FormBuilder,
    private mensagemService: MensagemService,
    private readonly usuarioService: UsuariosService,
    private readonly lojaService: LojasService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService) {
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
  lstParceiro: Array<Parceiro>;
  parceiroSelecionado: Parceiro;
  lstParceiroFiltrado: Array<Parceiro>;
  lstLoja: Array<Lojas>;
  lojaSelecionada: Lojas;
  lstLojaFiltrada: Array<Lojas>;
  lstVendedores: Array<Usuario>;
  vendedorSelecionado: Usuario;
  lstVendedoresFiltrado: Array<Usuario>;
  nome_numero: string;
  vendedorParceiroSelecionado: any;
  lstVendedoresParceiroFiltrado: Array<any>;

  ngOnInit(): void {

    this.montarLista();
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
  }

  montarLista() {
    this.cols = [
      { field: 'Data', header: 'Data' },
      { field: 'Numero', header: 'Número' },
      { field: 'Nome', header: 'Nome' },
      { field: 'Status', header: 'Status' },
      { field: 'Valor', header: 'Valor' }
    ];
  }

  iniciarFiltro(param: any) {
    let parametro = param.filtro;
    if (parametro == "orcamentos" || parametro == "pendente") {
      this.emPedidos = false;
      this.montarSelectFiltro();
      this.buscarOrcamentos();
      this.setarFiltro(parametro);
      this.filtrar(false);
    }
    if (parametro == "pedido") {
      this.emPedidos = true;
      this.montarSelectFiltro();
      this.buscarPedidos();
      this.setarFiltro(parametro);
      this.filtrar(false);
    }
    this.buscarParceiros();
    this.buscarLojas();
    this.buscarVendedores();
  }

  setarFiltro(filtro: string) {
    this.filtro.Status = new Array<string>();
    this.lstFiltro.map((m) => {
      let map: string = m.value.toLowerCase();
      if (map.indexOf(filtro) > -1) {
        this.filtro.Status.push(m.value);
      }
    });
  }

  buscarOrcamentos() {
    if (!this.emPedidos) {
      this.orcamentoService.buscarListaOrcamento().toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  buscarPedidos() {
    if (this.emPedidos) {
      this.pedidoService.buscarListaPedidos().toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  buscarParceiros() {
    

    // this.usuarioService.buscarParceiros().toPromise().then((r) => {
    //   if (r != null) {
    //     this.lstParceiro = r;
    //   }
    // }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

  buscarLojas() {
    this.lojaService.buscarTodasLojas().toPromise().then((r) => {
      if (r != null) {
        this.lstLoja = r;
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedores() {
    this.usuarioService.buscarVendedores().toPromise().then((r) => {
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
    let query = event.query;
    this.lstLojaFiltrada = this.lstLoja.filter(r => r.loja.toLowerCase().indexOf(query.toLowerCase()) > -1
      || r.nome.toLowerCase().indexOf(query.toLowerCase()) > -1);
  }

  filtrarVendedores(event: any) {
    let query = event.query;
    this.lstVendedoresFiltrado = this.lstVendedores;//.filter(r => r.usuario.toLowerCase().indexOf(query.toLowerCase()) > -1 && r.loja == "205");
  }

  montarSelectFiltro() {
    if (this.emPedidos) {
      this.lstFiltro = [
        { label: "Em espera", value: "Em espera" },
        { label: "A entregar", value: "A entregar" },
        { label: "Entregue", value: "Entregue" },
        { label: "Split possível", value: "Split possível" },
        { label: "Separar mercadoria", value: "Separar mercadoria" },
        { label: "Cancelado", value: "Cancelado" }
      ];
    }
    if (!this.emPedidos) {
      this.lstFiltro = [
        { label: "Expirado", value: "Expirado" },
        { label: "Virou pedido", value: "Virou pedido" },
        { label: "Encerrado (Cancelado)", value: "Encerrado (Cancelado)" },
        { label: "Pendente de aprovação do cliente", value: "Pendente de aprovação do cliente" },
        { label: "Pendente de aprovação de desconto", value: "Pendente de aprovação de desconto" },
        { label: "Pendente de revisão de dados", value: "Pendente de revisão de dados" },
        { label: "Desconto negado", value: "Desconto negado" },
        { label: "Desconto aprovado", value: "Desconto aprovado" }
      ]
    }

  }

  filtrar(mostrarMensagem: boolean) {
    if (mostrarMensagem)
      this.mensagemService.showWarnViaToast("Estamos implementando!");
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

      linha.Data = l.Data;
      linha.Numero = l.Nome;
      linha.Nome = l.Nome;
      linha.Status = l.Status;
      linha.Valor = this.moedaUtils.formatarMoedaComPrefixo(l.Valor);

      lstExport.push(linha);
    });

    return lstExport;
  }
}
