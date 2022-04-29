import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MoedaUtils } from '../../../utilities/formatarString/moeda-utils';
import { Usuario } from '../../../dto/usuarios/usuario';
import { OrcamentistaIndicadorDto } from '../../../dto/orcamentista-indicador/orcamentista-indicador';
import { ListaDto, ListaDtoExport } from '../../../dto/orcamentos/lista-dto';
import { Filtro } from '../../../dto/orcamentos/filtro';
import { AlertaService } from '../../../components/alert-dialog/alerta.service';
import { ExportExcelService } from '../../../service/export-files/export-excel.service';
import { UsuariosService } from '../../../service/usuarios/usuarios.service';
import { OrcamentosService } from '../orcamentos.service';
import { AutenticacaoService } from '../../../service/autenticacao/autenticacao.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api/selectitem';
import { FormBuilder, FormGroup } from '@angular/forms';
import { enumParametros } from '../enumParametros';
import { OrcamentoCotacaoStatus } from '../models/OrcamentoCotacaoStatus';
import { DropDownItem } from '../models/DropDownItem';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { ButtonArClubeComponent } from 'src/app/components/button/button-arclube.component';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class OrcamentosListarComponent implements OnInit {

  // @ViewChild(ButtonArClubeComponent, {static: false})
  // button: ButtonArClubeComponent

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly orcamentoService: OrcamentosService,
    private readonly usuarioService: UsuariosService,
    private readonly exportExcelService: ExportExcelService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
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

  ngOnInit(): void {
    this.inscricao = this.activatedRoute.params.subscribe((param: any) => { this.iniciarFiltro(param); });
    this.criarForm();
    this.criarTabela();
    this.buscarRegistros();
  }

  iniciarFiltro(param: any) {
    this.parametro = param.filtro.toUpperCase();

    if(this.parametro == enumParametros.PENDENTES) {
      //this.form.controls.status.setValue(7);
    }
  }

  btnFiltrar_Click(){
    alert("Teste")
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
          { field: 'Valor', header: 'Valor' },
          { field: 'Status', header: 'Status' },
          { field: 'Mensagem', header: 'Msg. Pendente', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
          { field: 'DtExpiracao', header: 'Expiracao', visible: (this.parametro != enumParametros.ORCAMENTOS ? 'none' : '') },
          { field: 'DtCadastro', header: 'Data' },
          { field: 'Editar', header: " ", visible: 'none' },
        ];
    });
  }

  buscarRegistros() {
    this.filtro.Origem = this.parametro;
    this.filtro.Loja = this.autenticacaoService._lojaLogado;

    this.orcamentoService.buscarRegistros(this.filtro).toPromise().then((r) => {
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
    if(this.filtro.Status)   { lstFiltroStatus = this.lstDto.filter(s => this.filtro.Status.includes(s.Status)); }
    if(this.filtro.Mensagem) { lstFiltroMensagem = this.lstDto.filter(s => this.filtro.Mensagem == s.Mensagem) };
    if(this.filtro.DtInicio && this.filtro.DtFim) { lstFiltroDatas = this.lstDto.filter(s => (new Date(s.DtCadastro)) >= this.filtro.DtInicio && (new Date(s.DtCadastro) <= this.filtro.DtFim)); };

    console.log('Status:   ' + this.filtro.Status);
    console.log('Vendedor: ' + this.filtro.Vendedor);
    console.log('Parceiro: ' + this.filtro.Parceiro);
    console.log('Mensagem: ' + this.filtro.Mensagem);
    console.log('Data Ini: ' + this.filtro.DtInicio);
    console.log('Data Fim: ' + this.filtro.DtFim);

    if( (this.filtro.Status === undefined || this.filtro.Status == null)
      && (this.filtro.Vendedor === undefined || this.filtro.Vendedor == null)
      && (this.filtro.Parceiro === undefined || this.filtro.Parceiro == null)
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
      if(lstFiltroMensagem.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(x=> this.filtro.Mensagem == x.Mensagem); }
      if(lstFiltroDatas.length > 0) { this.lstDtoFiltrada = this.lstDtoFiltrada.filter(s => (new Date(s.DtCadastro) >= this.filtro.DtInicio) && (new Date(s.DtCadastro) <= this.filtro.DtFim)); }
    }

    console.log('Status  .length: ' + lstFiltroStatus.length);
    console.log('Vendedor.length: ' + lstFiltroVendedor.length);
    console.log('Parceiro.length: ' + lstFiltroParceiro.length);
    console.log('Mensagem.length: ' + lstFiltroMensagem.length);
    console.log('Datas   .length: ' + lstFiltroDatas.length);
    console.log('filtrar FIM: ' + this.lstDtoFiltrada.length);
    console.log('#####################################################');

    this.popularTela();
  }

    cboStatus_onChange(event) {
        console.log('cboStatus_onChange');
        this.Pesquisar_Click();
        // if(event.value) {
        //     this.buscarParceiros();
        // }
    }

    cboVendedor_onChange(event) {
        console.log('cboVendedor_onChange');
        this.Pesquisar_Click();
        // if(event.value) {
        //     this.buscarParceiros();
        // }
    }

    cboParceiro_onChange(event) {
        console.log('cboParceiro_onChange');
        this.Pesquisar_Click();
        // if(event.value) {
        //     this.buscarVendedoresParceiros(event.value);
        // }
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

