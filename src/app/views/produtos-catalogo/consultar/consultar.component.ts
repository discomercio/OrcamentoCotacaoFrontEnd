import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationStart, Router, RoutesRecognized } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from 'src/app/views/orcamentos/models/DropDownItem';
import { ProdutoCatalogoPropriedade } from '../../../dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoListar } from "src/app/dto/produtos-catalogo/ProdutoCatalogoListar";
import { ProdutoCatalogoResponse } from '../../../dto/produtos-catalogo/ProdutoCatalogoResponse';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.scss']
})
export class ProdutosCatalogoConsultarComponent implements OnInit, AfterViewInit {

  constructor(
    private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly cdr: ChangeDetectorRef) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  //registros: ProdutoAtivoDto[];
  //registrosFiltrados: ProdutoAtivoDto[];
  cols: any[];
  carregando: boolean = false;
  //stringUtils = StringUtils;
  produtoCatalogResponse: ProdutoCatalogoResponse[];

  fabricantes: Array<DropDownItem> = new Array<DropDownItem>();
  descargacondensadoras: Array<DropDownItem> = new Array<DropDownItem>();
  voltagens: Array<DropDownItem> = new Array<DropDownItem>();
  capacidades: Array<DropDownItem> = new Array<DropDownItem>();
  ciclos: Array<DropDownItem> = new Array<DropDownItem>();
  tipounidades: Array<DropDownItem> = new Array<DropDownItem>();

  fabricantesSelecionados: string[] = [];
  codAlfaNumFabricanteSelecionado: string = "";
  descargaCondensadoraSelecionado: string = "";
  voltagemSelecionadas: string[] = [];
  capacidadeSelecionadas: string[] = [];
  cicloSelecionado: string = "";
  tipoUnidadeSelecionado: string[] = [];

  qtdePorPaginaInicial: number = 10;
  mostrarQtdePorPagina: boolean = false;
  qtdePorPaginaSelecionado: number = 10;
  first: number = 0;
  qtdeRegistros: number;
  filtro: ProdutoCatalogoListar = new ProdutoCatalogoListar();

  urlAnterior: string;
  visualizando: boolean = false;
  
  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoConsultar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    

    this.carregando = true;
    this.buscarPropriedades();
    this.carregarFabricante();
    this.carregando = false;
  }

  ngAfterViewInit(): void {
    let url = sessionStorage.getItem("urlAnterior");
    if (!!url && url.indexOf("/produtos-catalogo/visualizar") > -1) {
      let json = sessionStorage.getItem("filtro");
      this.filtro = JSON.parse(json);
      this.buscarTodosProdutos(this.filtro);
    }
    this.cdr.detectChanges();
  }

  // criarForm() {
  //   this.form = this.fb.group({
  //     CalculadoraVRF: [''],
  //     TipoUnidade: [''],
  //     DescargaCondensadora: [''],
  //     Voltagem: [''],
  //     CapacidadeBTU: [''],
  //     Ciclo: [''],
  //     LinhaProduto: ['']
  //   });
  // }

  buscarPropriedades() {
    this.service.buscarPropriedades().toPromise().then((propieidade) => {
      if (propieidade != null) {

        let descargaCondensadora = propieidade.filter(x => x.descricao.trim().toUpperCase() == "DESCARGA CONDENSADORA");
        let voltagens = propieidade.filter(x => x.descricao.trim().toUpperCase() == "VOLTAGEM");
        let capacidades = propieidade.filter(x => x.descricao.trim().toUpperCase() == "CAPACIDADE (BTU/H)");
        let ciclos = propieidade.filter(x => x.descricao.trim().toUpperCase() == "CICLO");
        let tipounidades = propieidade.filter(x => x.descricao.trim().toUpperCase() == "TIPO DA UNIDADE");

        this.service.buscarOpcoes().toPromise().then((opcao) => {

          if (opcao != null) {
            opcao.forEach(e => {
              if (e.id_produto_catalogo_propriedade == descargaCondensadora[0].id.toString()) {
                this.descargacondensadoras.push({ Id: e.id, Value: e.valor });
              }

              if (e.id_produto_catalogo_propriedade == voltagens[0].id.toString()) {
                this.voltagens.push({ Id: e.id, Value: e.valor });
              }

              if (e.id_produto_catalogo_propriedade == capacidades[0].id.toString()) {
                this.capacidades.push({ Id: e.id, Value: e.valor });
              }

              if (e.id_produto_catalogo_propriedade == ciclos[0].id.toString()) {
                this.ciclos.push({ Id: e.id, Value: e.valor });
              }

              if (e.id_produto_catalogo_propriedade == tipounidades[0].id.toString()) {
                this.tipounidades.push({ Id: e.id, Value: e.valor });
              }
            });
          }
        });
      }
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
  }

  carregarFabricante() {
    this.service.buscarFabricantes().toPromise().then((r) => {
      if (r != null) {
        r.forEach(e => {
          this.fabricantes.push({ Id: e.Fabricante, Value: e.Nome });
        });
      }
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
    });
  }

  buscarTodosProdutos(filtro: ProdutoCatalogoListar) {

    sessionStorage.setItem("filtro", JSON.stringify(filtro));

    this.carregando = true;
    this.produtoCatalogResponse = new Array<ProdutoCatalogoResponse>();
    this.service.ListarProdutoCatalogo(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.mostrarQtdePorPagina = false;
        this.carregando = false;
        return;
      }

      this.produtoCatalogResponse = r.listaProdutoCatalogoResponse;
      this.mostrarQtdePorPagina = true;
      this.qtdeRegistros = r.qtdeRegistros;
      this.carregando = false;

      if (!!this.filtro.pagina)
        this.first = this.filtro.pagina * this.filtro.qtdeItensPorPagina;
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
  }

  pesquisar() {
    let filtro = this.setarFiltro();
    this.buscarTodosProdutos(filtro);
  }

  setarFiltro(): ProdutoCatalogoListar {
    let produtoCatalogoListar = new ProdutoCatalogoListar();

    if (!this.filtro.fabricantesSelecionados || this.filtro.fabricantesSelecionados.length == 0) {
      produtoCatalogoListar.fabricantesSelecionados = undefined;
    } else {
      produtoCatalogoListar.fabricantesSelecionados = this.filtro.fabricantesSelecionados;
    }
    if (!this.filtro.codAlfaNumFabricanteSelecionado || this.filtro.codAlfaNumFabricanteSelecionado == "") {
      produtoCatalogoListar.codAlfaNumFabricanteSelecionado = undefined;
    }
    else {
      produtoCatalogoListar.codAlfaNumFabricanteSelecionado = this.filtro.codAlfaNumFabricanteSelecionado;
    }
    if (!this.filtro.voltagemSelecionadas || this.filtro.voltagemSelecionadas.length == 0) {
      produtoCatalogoListar.voltagemSelecionadas = undefined;
    }
    else {
      produtoCatalogoListar.voltagemSelecionadas = this.filtro.voltagemSelecionadas;
    }
    if (!this.filtro.capacidadeSelecionadas || this.filtro.capacidadeSelecionadas.length == 0) {
      produtoCatalogoListar.capacidadeSelecionadas = undefined;
    }
    else {
      produtoCatalogoListar.capacidadeSelecionadas = this.filtro.capacidadeSelecionadas;
    }
    if (!this.filtro.tipoUnidadeSelecionado || this.filtro.tipoUnidadeSelecionado.length == 0) {
      produtoCatalogoListar.tipoUnidadeSelecionado = undefined;
    }
    else {
      produtoCatalogoListar.tipoUnidadeSelecionado = this.filtro.tipoUnidadeSelecionado;
    }

    produtoCatalogoListar.descargaCondensadoraSelecionado = this.filtro.descargaCondensadoraSelecionado;
    produtoCatalogoListar.cicloSelecionado = this.filtro.cicloSelecionado;
    produtoCatalogoListar.ativoSelecionado = "true";
    produtoCatalogoListar.pagina = 0;
    produtoCatalogoListar.qtdeItensPorPagina = this.qtdePorPaginaInicial;
    this.filtro.qtdeItensPorPagina = this.qtdePorPaginaInicial;

    this.first = 0;
    return produtoCatalogoListar;
  }

  buscarRegistros(event: LazyLoadEvent) {
    let filtro = this.setarFiltro();
    if (!!this.produtoCatalogResponse && this.produtoCatalogResponse.length > 0) {
      filtro.pagina = event.first / event.rows;
      this.filtro.pagina = filtro.pagina;
      filtro.qtdeItensPorPagina = event.rows;
      this.filtro.qtdeItensPorPagina = event.rows;
      this.buscarTodosProdutos(filtro);
    }
  }

  
  visualizarClick(id: number) {
    this.visualizando = true;
    sessionStorage.setItem("urlAnterior", "/produtos-catalogo/visualizar");
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

  ngOnDestroy() {
    if (!this.visualizando) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
  }
}