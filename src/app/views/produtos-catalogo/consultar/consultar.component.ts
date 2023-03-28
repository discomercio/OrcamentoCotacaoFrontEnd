// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Table } from 'primeng/table';
// import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
// import { ProdutoAtivoDto } from 'src/app/dto/produtos-catalogo/ProdutoAtivoDto';
// import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
// import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
// import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
// import { DropDownItem } from '../../orcamentos/models/DropDownItem';
// import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
// import { ePermissao } from 'src/app/utilities/enums/ePermissao';
// import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
// import { ProdutoCatalogoListar } from "src/app/dto/produtos-catalogo/ProdutoCatalogoListar";
// import { ProdutoCatalogoResponse } from '../../../dto/produtos-catalogo/ProdutoCatalogoResponse';

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
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.scss']
})
export class ProdutosCatalogoConsultarComponent implements OnInit {

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

  buscarTodosProdutos() {
    let produtoCatalogoListar = new ProdutoCatalogoListar();
    produtoCatalogoListar.fabricantesSelecionados = this.fabricantesSelecionados;
    produtoCatalogoListar.codAlfaNumFabricanteSelecionado = this.codAlfaNumFabricanteSelecionado;
    produtoCatalogoListar.descargaCondensadoraSelecionado  = this.descargaCondensadoraSelecionado;
    produtoCatalogoListar.voltagemSelecionadas = this.voltagemSelecionadas;
    produtoCatalogoListar.capacidadeSelecionadas = this.capacidadeSelecionadas;
    produtoCatalogoListar.cicloSelecionado = this.cicloSelecionado;
    produtoCatalogoListar.tipoUnidadeSelecionado = this.tipoUnidadeSelecionado;
    produtoCatalogoListar.ativoSelecionado = "true";

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

  visualizarClick(id: number) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }
}