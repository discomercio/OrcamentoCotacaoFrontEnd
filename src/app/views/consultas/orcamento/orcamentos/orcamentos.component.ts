import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { BuscarParceiroRequest } from 'src/app/dto/orcamentista-indicador/buscar-parceiro-request';
import { ConsultaGerencialOrcamentoRequest } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-request';
import { ConsultaGerencialOrcamentoResponse } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ExportExcelService } from 'src/app/service/export-files/export-excel.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from 'src/app/views/orcamentos/models/DropDownItem';

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.component.html',
  styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentoService: OrcamentosService,
    private readonly sweetAlertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentistaService: OrcamentistaIndicadorService,
    private readonly produtoCatalogoService: ProdutoCatalogoService,
    private router: Router,
    private readonly exportExcelService: ExportExcelService,
    public readonly cdr: ChangeDetectorRef) { }

  @Input() listaNome = "";

  form: FormGroup;
  nomeLista: string;
  consultaOrcamentoGerencialResponse = new Array<ConsultaGerencialOrcamentoResponse>();
  consultaOrcamentoGerencialResquest: ConsultaGerencialOrcamentoRequest = new ConsultaGerencialOrcamentoRequest();
  first: number = 0;
  qtdeRegistros: number;
  carregando: boolean = true;
  qtdePorPaginaInicial: number = 10;
  qtdePorPaginaSelecionado: number = 10;
  dataUtils: DataUtils = new DataUtils();
  mostrarQtdePorPagina: boolean = false;
  permissaoUniversal: boolean = false;
  bloqueiaParceiro: boolean = false;

  //Combos
  cboVendedores: Array<any> = [];
  cboFiltradoVendedores: Array<any> = [];
  cboLojas: Array<DropDownItem> = [];
  cboParceiros: Array<any> = [];
  cboFiltradoParceiros: Array<any> = [];
  cboComParceiros: Array<DropDownItem> = [];
  cboFabricantes: Array<DropDownItem> = [];
  cboGrupos: Array<DropDownItem> = [];
  //filtros
  lojas: Array<string> = new Array<string>();
  vendedor: any;
  parceiro: any;
  comParceiro: number;
  fabricante: any;
  grupo: string;
  dtCriacaoInicio: Date;
  dtCriacaoFim: Date;
  dataAtual: Date;

  ngOnInit(): void {

    if (this.listaNome == "vigentes") this.nomeLista = "Vigentes";
    if (this.listaNome == "cadastrados") this.nomeLista = "Cadastrados";
    if (this.listaNome == "pendentes") this.nomeLista = "com Mensagens Pendentes";
    if (this.listaNome == "expirados") this.nomeLista = "Expirados";

    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar))
      this.permissaoUniversal = true;
    else {
      this.vendedor = { Id: this.autenticacaoService.usuario.id, Value: this.autenticacaoService._usuarioLogado, Label: "" };
      this.consultaOrcamentoGerencialResquest.vendedor = this.vendedor.Id;
    }

    this.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService._lojasUsuarioLogado;

    this.criarForm();
    // this.buscarCboVendedores();
    // this.buscarCboParceiros();
    this.buscarCboLojas();
    this.buscarCboComParceiro();
    this.buscarCboFabricantes();
    this.buscarCboGrupos();

    this.dataAtual = new Date();
  }

  criarForm() {
    this.form = this.fb.group({
      vendedor: [],
      loja: [],
      comParceiro: [],
      parceiro: [],
      vendedorParceiro: [],
      fabricante: [],
      grupo: [],
      dtCriacaoInicio: [],
      dtCriacaoFim: []
    });
  }

  buscarCboVendedores() {
    if (this.permissaoUniversal) {
      this.vendedor = null;
      this.buscarCboParceiros();
      let request = new UsuariosPorListaLojasRequest();
      if (this.lojas.length > 0) request.lojas = this.lojas;
      else request.lojas = this.autenticacaoService.usuario.lojas;

      this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise().then((r) => {
        if (!r.Sucesso) {
          this.sweetAlertService.aviso(r.Mensagem);
          return;
        }
        this.cboVendedores = new Array<any>();
        r.usuarios.forEach(x => {
          this.cboVendedores.push({ Id: x.id, Value: x.vendedor, Label: x.nomeIniciaisMaiusculo });
        });

        this.cboFiltradoVendedores = this.cboVendedores;


      }).catch((e) => {
        this.sweetAlertService.aviso(e.error.Mensagem);
      });


    }
  }

  buscarCboParceiros() {

    if (this.comParceiro == 2) return;

    let filtro: BuscarParceiroRequest = new BuscarParceiroRequest();

    if (!!this.vendedor) {
      filtro.vendedor = this.vendedor.Value.toString();
    }
    if (this.lojas.length <= 0)
      filtro.lojas = this.consultaOrcamentoGerencialResquest.lojas;
    else filtro.lojas = this.lojas;

    this.cboFiltradoParceiros = new Array<any>();
    this.cboParceiros = new Array<any>();

    this.orcamentistaService.buscarParceirosPorIdVendedor(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        return;
      }
      r.parceiros.forEach(x => {
        this.cboParceiros.push(Object.assign({}, { Id: x.id, Value: x.razaoSocial }));
      });
      this.parceiro = null;
      this.cboFiltradoParceiros = Object.assign({}, this.cboParceiros);
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
    });
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

  filtrarParceiros(event) {
    let filtrado: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.cboParceiros.length; i++) {
      let parca = this.cboParceiros[i];
      if (parca.Value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(parca);
      }
    }
    this.cboFiltradoParceiros = filtrado;
  }

  buscarLista(filtro: ConsultaGerencialOrcamentoRequest) {

    sessionStorage.setItem("filtro", JSON.stringify(filtro));
    this.carregando = true;
    this.consultaOrcamentoGerencialResponse = new Array<ConsultaGerencialOrcamentoResponse>();
    this.orcamentoService.consultaGerencial(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.mostrarQtdePorPagina = false;
        this.sweetAlertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }
      this.consultaOrcamentoGerencialResponse = r.lstConsultaGerencialOrcamentoResponse;
      this.qtdeRegistros = r.qtdeRegistros;
      this.carregando = false;
      this.mostrarQtdePorPagina = true;
      if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) {
        this.first = 0;
        this.qtdePorPaginaInicial = this.qtdePorPaginaSelecionado;
      }
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
      this.carregando = false;
    });

  }

  buscarRegistros(event: LazyLoadEvent) {
    this.setarFiltroBusca();
    if (this.consultaOrcamentoGerencialResponse.length > 0) {
      this.consultaOrcamentoGerencialResquest.pagina = event.first / event.rows;
      this.consultaOrcamentoGerencialResquest.qtdeItensPagina = event.rows;
      this.qtdePorPaginaSelecionado = event.rows;
      if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) this.consultaOrcamentoGerencialResquest.pagina = 0;
      this.buscarLista(this.consultaOrcamentoGerencialResquest);
    }
  }

  ascendente: boolean = false;
  colunaOrdenacao: string;
  ordenar(coluna: string) {
    if (coluna == this.colunaOrdenacao) this.ascendente = !this.ascendente;
    else this.ascendente = false;

    this.colunaOrdenacao = coluna;

    this.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.ascendente;
    this.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = this.colunaOrdenacao;
    this.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.qtdePorPaginaInicial;
    this.consultaOrcamentoGerencialResquest.lojas = this.lojas.length > 0 ? this.lojas : this.autenticacaoService._lojasUsuarioLogado;
    this.consultaOrcamentoGerencialResquest.pagina = 0;
    this.buscarLista(this.consultaOrcamentoGerencialResquest);
    this.first = 0;
    this.cdr.detectChanges();
  }

  buscarCboLojas() {
    let lojasUsuario = this.autenticacaoService._lojasUsuarioLogado;
    lojasUsuario.forEach(x => {
      this.cboLojas.push({ Id: x, Value: x });
    });
  }

  pesquisar() {
    this.setarFiltroBusca();
    this.buscarLista(this.consultaOrcamentoGerencialResquest);
  }

  setarFiltroBusca() {
    if (this.lojas.length > 0){
      this.consultaOrcamentoGerencialResquest.lojas = this.lojas;
      this.consultaOrcamentoGerencialResquest.lojasSelecionadas = this.lojas;
    } 
    else{
      this.consultaOrcamentoGerencialResquest.lojasSelecionadas = null;
      this.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService.usuario.lojas;
    } 

    this.consultaOrcamentoGerencialResquest.vendedor = !this.vendedor ? 0 : this.vendedor.Id.toString();
    //apenas para achar o vendedor selecionado
    this.consultaOrcamentoGerencialResquest.vendedorSelecionado = this.vendedor;

    if (!this.comParceiro) this.consultaOrcamentoGerencialResquest.comParceiro = undefined;
    if (this.comParceiro == 1) this.consultaOrcamentoGerencialResquest.comParceiro = true;
    if (this.comParceiro == 2) this.consultaOrcamentoGerencialResquest.comParceiro = false;

    this.consultaOrcamentoGerencialResquest.idParceiro = !this.parceiro ? undefined : this.parceiro.Id;
    this.consultaOrcamentoGerencialResquest.parceiroSelecionado = this.parceiro;

    this.consultaOrcamentoGerencialResquest.fabricante = !this.fabricante ? undefined : this.fabricante;

    this.consultaOrcamentoGerencialResquest.grupo = !!this.grupo ? this.grupo : undefined;

    this.consultaOrcamentoGerencialResquest.dataCriacaoInicio =
      !!this.dtCriacaoInicio && DataUtils.validarData(this.dtCriacaoInicio) ?
        DataUtils.formata_dataString_para_formato_data(this.form.controls.dtCriacaoInicio.value.toLocaleString("pt-br").slice(0, 10)) : undefined;
    this.consultaOrcamentoGerencialResquest.dataCriacaoFim =
      !!this.dtCriacaoFim && DataUtils.validarData(this.dtCriacaoFim) ?
        DataUtils.formata_dataString_para_formato_data(this.form.controls.dtCriacaoFim.value.toLocaleString("pt-br").slice(0, 10)) : undefined;

    this.consultaOrcamentoGerencialResquest.pagina = 0;
    this.first = 0;
  }

  buscarCboComParceiro() {
    this.cboComParceiros.push({ Id: 1, Value: "Sim" });
    this.cboComParceiros.push({ Id: 2, Value: "Não" });
  }

  buscarCboFabricantes() {

    this.produtoCatalogoService.buscarFabricantes().toPromise().then((r) => {
      if (r != null) {

        r.forEach(x => {
          this.cboFabricantes.push({ Id: x.Fabricante, Value: x.Nome });
        });
      }
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem)
    });
  }

  buscarCboGrupos() {
    this.produtoCatalogoService.buscarGruposProdutos().toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        return;
      }
      r.produtosGrupos.forEach(x => {
        this.cboGrupos.push({ Id: x.codigo, Value: x.descricao });
      })
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
    });
  }

  visualizarOrcamento(orcamento: number) {
    this.router.navigate(["orcamentos/aprovar-orcamento", orcamento]);
  }

  exportarCSV() {
    this.consultaOrcamentoGerencialResquest.pagina = 0;
    this.consultaOrcamentoGerencialResquest.qtdeItensPagina = 0;
    let lista = new Array<ConsultaGerencialOrcamentoResponse>();
    this.orcamentoService.consultaGerencial(this.consultaOrcamentoGerencialResquest).toPromise().then((r) => {
      let dataUtils = new DataUtils();
      r.lstConsultaGerencialOrcamentoResponse.forEach(x => {
        let item = new ConsultaGerencialOrcamentoResponse();
        item = x;
        item.dataCriacao = dataUtils.formata_data_DDMMYYY(x.dataCriacao);
        item.dataExpiracao = dataUtils.formata_data_DDMMYYY(x.dataExpiracao);
        lista.push(item);
      });
      this.exportExcelService.exportAsCSVFile(lista, `relatorio-orçamentos-${this.consultaOrcamentoGerencialResquest.nomeLista}`);
    }).catch((e) => {
      this.sweetAlertService.aviso(e.erroe.Mensagem);
    });
  }

  exportXlsx() {
    this.consultaOrcamentoGerencialResquest.pagina = 0;
    this.consultaOrcamentoGerencialResquest.qtdeItensPagina = 0;
    let lista = new Array<ConsultaGerencialOrcamentoResponse>();
    this.orcamentoService.consultaGerencial(this.consultaOrcamentoGerencialResquest).toPromise().then((r) => {
      let dataUtils = new DataUtils();
      r.lstConsultaGerencialOrcamentoResponse.forEach(x => {
        let item = new ConsultaGerencialOrcamentoResponse();
        item = x;
        item.dataCriacao = dataUtils.formata_data_DDMMYYY(x.dataCriacao);
        item.dataExpiracao = dataUtils.formata_data_DDMMYYY(x.dataExpiracao);
        lista.push(item);
      });
      this.exportExcelService.exportAsXLSXFile(lista, `relatorio-orçamentos-${this.consultaOrcamentoGerencialResquest.nomeLista}`);
    }).catch((e) => {
      this.sweetAlertService.aviso(e.erroe.Mensagem);
    });
  }

  verificarParceiro() {
    if (this.comParceiro == 2) {
      this.bloqueiaParceiro = true;
      this.parceiro = undefined;
      return;
    }

    this.bloqueiaParceiro = false;
  }
}
