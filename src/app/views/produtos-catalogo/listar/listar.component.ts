import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoListarComponent implements OnInit {

  constructor(
    private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

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

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.carregando = true;
    this.buscarPropriedades();
    this.carregarFabricante();
    this.carregarImagem();
    this.carregarAtivo();
    this.carregando = false;
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

          if(opcao != null) {
            opcao.forEach(e => {
              if(e.id_produto_catalogo_propriedade == descargaCondensadora[0].id.toString()) {
                this.descargacondensadoras.push({ Id: e.id, Value: e.valor }); 
              }

              if(e.id_produto_catalogo_propriedade == voltagens[0].id.toString()) {
                this.voltagens.push({ Id: e.id, Value: e.valor });
              }

              if(e.id_produto_catalogo_propriedade == capacidades[0].id.toString()) {
                this.capacidades.push({ Id: e.id, Value: e.valor }); 
              }

              if(e.id_produto_catalogo_propriedade == ciclos[0].id.toString()) {
                this.ciclos.push({ Id: e.id, Value: e.valor }); 
              }

              if(e.id_produto_catalogo_propriedade == tipounidades[0].id.toString()) {
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

  buscarTodosProdutos() {
    let produtoCatalogoListar = new ProdutoCatalogoListar();
    produtoCatalogoListar.fabricantesSelecionados = this.fabricantesSelecionados;
    produtoCatalogoListar.codAlfaNumFabricanteSelecionado = this.codAlfaNumFabricanteSelecionado;
    produtoCatalogoListar.descargaCondensadoraSelecionado  = this.descargaCondensadoraSelecionado;
    produtoCatalogoListar.voltagemSelecionadas = this.voltagemSelecionadas;
    produtoCatalogoListar.capacidadeSelecionadas = this.capacidadeSelecionadas;
    produtoCatalogoListar.cicloSelecionado = this.cicloSelecionado;
    produtoCatalogoListar.tipoUnidadeSelecionado = this.tipoUnidadeSelecionado;
    produtoCatalogoListar.imagemSelecionado = this.imagemSelecionado;
    produtoCatalogoListar.ativoSelecionado = this.ativoSelecionado;

    this.carregando = true;
    this.service.ListarProdutoCatalogo(produtoCatalogoListar).toPromise().then((r) => {
      if (r != null) {
        this.produtoCatalogResponse = r;
      }
      this.carregando = false;
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregando = false;
    });
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
          this.buscarTodosProdutos();
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));

    });

  }

  criarClick() {
    this.router.navigate(["/produtos-catalogo/criar"]);
  }
}
