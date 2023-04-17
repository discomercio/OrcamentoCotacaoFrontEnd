import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoListarComponent implements OnInit, AfterViewInit {

  constructor(
    private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    public readonly cdr: ChangeDetectorRef) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;

  produtoCatalogResponse: ProdutoCatalogoResponse[];
  cols: any[];
  carregando: boolean = false;

  fabricantes: Array<DropDownItem> = new Array<DropDownItem>();
  descargacondensadoras: Array<DropDownItem> = new Array<DropDownItem>();
  voltagens: Array<DropDownItem> = new Array<DropDownItem>();
  capacidades: Array<DropDownItem> = new Array<DropDownItem>();
  ciclos: Array<DropDownItem> = new Array<DropDownItem>();
  tipounidades: Array<DropDownItem> = new Array<DropDownItem>();
  imagens: Array<DropDownItem> = new Array<DropDownItem>();
  ativos: Array<DropDownItem> = new Array<DropDownItem>();

  fabricantesSelecionados: string[] = [];
  codAlfaNumFabricanteSelecionado: string = "";
  descargaCondensadoraSelecionado: string = "";
  voltagemSelecionadas: string[] = [];
  capacidadeSelecionadas: string[] = [];
  cicloSelecionado: string = "";
  tipoUnidadeSelecionado: string[] = [];
  imagemSelecionado: string;
  ativoSelecionado: string;

  qtdePorPaginaInicial: number = 10;
  mostrarQtdePorPagina: boolean = false;
  qtdePorPaginaSelecionado: number = 10;
  first: number = 0;
  qtdeRegistros: number;
  urlAnterior: any;
  filtro: ProdutoCatalogoListar = new ProdutoCatalogoListar();

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.urlAnterior = sessionStorage.getItem("urlAnterior");

    this.carregando = true;
    this.buscarPropriedades();
    this.carregarFabricante();
    this.carregarImagem();
    this.carregarAtivo();
    this.carregando = false;
  }

  ngAfterViewInit(): void {
    // //se veio de clonar, editar e excluir, vamos manter os filtros
    // if (this.urlAnterior && this.urlAnterior.indexOf("/produtos-catalogo/visualizar") > -1 ||
    //   this.urlAnterior && this.urlAnterior.indexOf("/produtos-catalogo/editar") > -1 ||
    //   this.urlAnterior && this.urlAnterior.indexOf("/produtos-catalogo/clonar") > -1) {
    //   let sessionStorageFiltro = sessionStorage.getItem("filtro");
    //   this.filtro = JSON.parse(sessionStorageFiltro);
        
    // }
    // else {
    //   debugger;
    //   sessionStorage.removeItem("filtro");
    // }

    // this.cdr.detectChanges();
  }

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

  carregarImagem() {
    this.imagens.push({ Id: 1, Value: "Sim" });
    this.imagens.push({ Id: 0, Value: "Não" });
  }

  carregarAtivo() {
    this.ativos.push({ Id: 1, Value: "Sim" });
    this.ativos.push({ Id: 0, Value: "Não" });
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
    
    if(!this.filtro.fabricantesSelecionados || this.filtro.fabricantesSelecionados.length == 0){
      produtoCatalogoListar.fabricantesSelecionados = undefined;
    }else{
      produtoCatalogoListar.fabricantesSelecionados = this.filtro.fabricantesSelecionados;
    }
    if(!this.filtro.codAlfaNumFabricanteSelecionado || this.filtro.codAlfaNumFabricanteSelecionado == ""){
      produtoCatalogoListar.codAlfaNumFabricanteSelecionado = undefined;
    }
    else{
      produtoCatalogoListar.codAlfaNumFabricanteSelecionado = this.filtro.codAlfaNumFabricanteSelecionado;
    }
    if(!this.filtro.voltagemSelecionadas || this.filtro.voltagemSelecionadas.length == 0){
      produtoCatalogoListar.voltagemSelecionadas = undefined;
    }
    else{
      produtoCatalogoListar.voltagemSelecionadas = this.filtro.voltagemSelecionadas;
    }
    if(!this.filtro.capacidadeSelecionadas || this.filtro.capacidadeSelecionadas.length == 0){
      produtoCatalogoListar.capacidadeSelecionadas = undefined;
    }
    else{
      produtoCatalogoListar.capacidadeSelecionadas = this.filtro.capacidadeSelecionadas;
    }
    if(!this.filtro.tipoUnidadeSelecionado || this.filtro.tipoUnidadeSelecionado.length == 0){
      produtoCatalogoListar.tipoUnidadeSelecionado = undefined;
    }
    else{
      produtoCatalogoListar.tipoUnidadeSelecionado = this.filtro.tipoUnidadeSelecionado;
    }

    produtoCatalogoListar.descargaCondensadoraSelecionado = this.filtro.descargaCondensadoraSelecionado;
    produtoCatalogoListar.cicloSelecionado = this.filtro.cicloSelecionado;
    produtoCatalogoListar.imagemSelecionado = this.filtro.imagemSelecionado;
    produtoCatalogoListar.ativoSelecionado = this.filtro.ativoSelecionado;
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
      filtro.qtdeItensPorPagina = event.rows;
      this.qtdePorPaginaSelecionado = event.rows;
      if (this.qtdePorPaginaInicial != this.qtdePorPaginaSelecionado) filtro.pagina = 0;
      this.buscarTodosProdutos(filtro);
    }
  }

  visualizarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

  editarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  clonarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/clonar", id]);
  }

  copiarClick(id: any) {

    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  excluirClick(id: any) {

    this.sweetAlertService.dialogo("", "Tem certeza que deseja excluir esse produto?").subscribe(result => {
      if (!result) return;

      this.service.excluirProduto(id).toPromise().then((r) => {
        if (r != null && r == true) {
          this.mensagemService.showSuccessViaToast("Produto excluído com sucesso!");
          this.carregando = false;
          this.pesquisar();
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));

    });

  }

  criarClick() {
    this.router.navigate(["/produtos-catalogo/criar"]);
  }

  ngOnDestroy() {
    // debugger;
    // incluir a rota de criar novo produto
    // if (this.router.routerState.snapshot.url.indexOf("/produtos-catalogo/editar/") > -1 ||
    //   this.router.routerState.snapshot.url.indexOf("/produtos-catalogo/clonar")) {
    //   sessionStorage.setItem("urlAnterior", this.router.routerState.snapshot.url)
    //   return;
    // }
    // sessionStorage.removeItem("urlAnterior");
    // sessionStorage.removeItem("filtro");
  }
}
