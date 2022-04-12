import { MoedaUtils } from './../../utilities/formatarString/moeda-utils';
import { Usuario } from './../../dto/usuarios/usuario';
import { OrcamentistaIndicadorDto } from './../../dto/orcamentista-indicador/orcamentista-indicador';
import { ListaDto, ListaDtoExport } from './../../dto/orcamentos/lista-dto';
import { Filtro } from './../../dto/orcamentos/filtro';
import { AlertaService } from './../../utilities/alert-dialog/alerta.service';
import { ExportExcelService } from './../../service/export-files/export-excel.service';
import { UsuariosService } from './../../service/usuarios/usuarios.service';
import { PedidosService } from './../../service/pedidos/pedidos.service';
import { OrcamentosService } from './../orcamentos.service';
import { AutenticacaoService } from './../../service/autenticacao/autenticacao.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { enumParametros } from '../enumParametros';
import { OrcamentoCotacaoStatus } from '../models/OrcamentoCotacaoStatus';
import { DropDownItem } from '../models/DropDownItem';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class OrcamentosListarComponent implements OnInit {

  constructor(
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private readonly orcamentoService: OrcamentosService,
    public readonly pedidoService: PedidosService,
    private readonly usuarioService: UsuariosService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = function() {
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
  lstVendedoresParceiros: Array<any>;
  public linhaSelecionada: ListaDto;

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
  lojaLogada: string = this.autenticacaoService._lojaLogado;

  ngOnInit(): void {
      console.log('ngOnInit() ngOnInit() ngOnInit() ngOnInit()');
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.popularCombos();
    this.buscarRegistros();
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
          { field: 'NumeroOrcamento', header: 'Orçamento' },
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
          { field: "DtExpiracao", header: "Expiracao" },
          { field: "DtCadastro", header: "Data" }
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
      var filtroPost = new Filtro();
      filtroPost.Origem = this.parametro;
      filtroPost.Status = this.form.controls.status.value;
      filtroPost.Nome_numero = this.form.controls.cliente.value;
      filtroPost.Vendedor = this.form.controls.vendedor.value;
      filtroPost.Parceiro = this.form.controls.parceiro.value;
      filtroPost.VendedorParceiro = this.form.controls.vendedorParceiro.value;
      filtroPost.Mensagem = this.form.controls.msgPendente.value;
      filtroPost.DtInicio = this.form.controls.dtInicio.value;
      filtroPost.DtFim = this.form.controls.dtFim.value;
      filtroPost.Loja = this.autenticacaoService._lojaLogado;

      this.orcamentoService.buscarRegistros(filtroPost).toPromise().then((r) => {
        if (r != null) {
          this.lstDto = r;
          this.lstDtoFiltrada = this.lstDto;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  popularCombos() {
    this.buscarStatus();
    this.buscarVendedores();
    this.buscarMensagens();
  }

  buscarStatus() {
    this.cboStatus = [];
    this.orcamentoService.buscarStatus(this.parametro).toPromise().then((r) => {
        if (r != null) {
            r.forEach(x => {
                this.cboStatus.push({ Id:x.Id, Value:x.Value});
            });
        }
        }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }

  buscarVendedores() {
    this.cboVendedores = [];
    this.usuarioService.buscarVendedores(this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
            r.forEach(x => {
                this.cboVendedores.push({ Id:x.nome, Value:x.nome});
            });
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceiros(vendedor) {
    this.cboParceiros = [];
    this.orcamentistaIndicadorService.buscarParceirosPorVendedor(vendedor, this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
            r.forEach(x => {
                this.cboParceiros.push({ Id:x.nome, Value:x.nome});
        });
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedoresParceiros(parceiro) {
    this.cboVendedoresParceiros = [];
    this.orcamentistaIndicadorVendedorService.buscarVendedoresParceiros(parceiro).toPromise().then((r) => {
        if (r != null) {
            r.forEach(x => {
                this.cboVendedoresParceiros.push({ Id:x.nome, Value:x.nome});
            });
        }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
    console.log('Status:   ' + this.filtro.Status);
    console.log('Vendedor: ' + this.filtro.Vendedor);
    console.log('Parceiro: ' + this.filtro.Parceiro);
    console.log('VendParc: ' + this.filtro.VendedorParceiro);
    console.log('Mensagem: ' + this.filtro.Mensagem);
    console.log('Data Ini: ' + this.filtro.DtInicio);
    console.log('Data Fim: ' + this.filtro.DtFim);
    console.log('#####################################################');
    this.buscarRegistros();
  }

    cboVendedor_onChange(event) {
        console.log('cboVendedor_onChange');
        this.buscarParceiros(event.value);
    }

    cboParceiro_onChange(event) {
        console.log('cboParceiro_onChange');
        this.buscarVendedoresParceiros(event.value);
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

