import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { stringify } from 'querystring';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { callbackify } from 'util';
import { ProdutoTela } from '../../orcamentos/novo-orcamento/select-prod-dialog/produto-tela';

@Component({
  selector: 'app-consultar',
  templateUrl: './consultar.component.html',
  styleUrls: ['./consultar.component.scss']
})
export class ProdutosCatalogoConsultarComponent implements OnInit {

  constructor(private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly router: Router) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  produtosPropriedadesAtivos: ProdutoCatalogoItemProdutosAtivosDados[];
  cols: any[];
  carregando: boolean = false;
  stringUtils = StringUtils;

  ngOnInit(): void {

    this.criarTabela();
    this.buscarPropriedadesProdutosAtivos();
    this.buscarPropriedadesEOpcoesProdutosAtivos();

  }

  criarTabela() {
    this.cols = [
      { field: "codigo", header: "Código", visible: true },
      { field: "Fabricante", header: "Fabricante", visible: true },
      { field: "Descricao", header: "Descrição", visible: true },
      { field: "IdPropriedade", header: "IdPropriedade", visible: false },
      { field: "Propriedade", header: "Propriedade", visible: true },
      { field: "Valor", header: "Valor", visible: true },
    ]
  }

  buscarPropriedadesProdutosAtivos() {
    this.produtoService.buscarPropriedadesProdutosAtivos().toPromise().then((r) => {
      if (r != null) {
        debugger;
        this.produtosPropriedadesAtivos = r;
        this.criarColunas();
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));


  }

  buscarPropriedadesEOpcoesProdutosAtivos() {
    this.produtoService.buscarPropriedadesEOpcoesProdutosAtivos().toPromise().then((r) => {
      if (r != null) {
        this.montarFiltrosDropDowns(r)
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  armazenaFiltro: any[] = [];
  drops: any[] = new Array<any>();
  montarFiltrosDropDowns(proprieadades: any[]) {
    let p = new Array<any>();
    p = proprieadades;

    let map = proprieadades.map(x => x.IdProdpriedade);
    let filtrado: any[] = map.filter(this.distinct);

    filtrado.forEach(x => {

      let filtro = proprieadades.filter(y => y.IdProdpriedade == x);
      let prop = { item: filtro[0].NomePropriedade, values: [] };


      let camposFiltro = { campo: prop.item, valor: "" };
      this.armazenaFiltro.push(camposFiltro);
      // prop.values[0].valor = "Selecione";
      filtro.forEach(f => {
        let v = { valor: f.ValorPropriedadeOpcao };
        prop.values.push(v)
      });
      this.drops.push(prop)
    });
  }

  private distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  produtosTabela = new Array<ProdutoTabela>();
  produtosTabelaApoio = new Array<ProdutoTabela>();
  criarColunas() {

    let filtrado = this.produtosPropriedadesAtivos.map(x => x.produto);
    let r: string[] = filtrado.filter(this.distinct);

    r.forEach(x => {
      let pp = this.produtosPropriedadesAtivos.filter(y => y.produto == x);
      let existe = this.produtosTabela.filter(f => f.produto == x);
      if (existe.length == 0) {
        if (pp && pp.length > 0) {
          let produtoTela = new ProdutoTabela();
          produtoTela.produto = pp[0].produto;
          produtoTela.fabricante = pp[0].fabricante + " - " + pp[0].fabricanteNome;
          produtoTela.descricao = pp[0].descricao;
          produtoTela.id = pp[0].id;
          produtoTela.linhaBusca = produtoTela.produto + "/" + pp[0].fabricante + "/" + pp[0].fabricanteNome + "/" + produtoTela.descricao + "/";

          pp.forEach(e => {
            let item: ProdutoCatalogoItemProdutosAtivosDados = new ProdutoCatalogoItemProdutosAtivosDados();
            if (!produtoTela.linhaProduto) {
              item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Linha de Produto")[0];
              if (item) {
                produtoTela.linhaProduto = item.valorPropriedade;
                produtoTela.linhaBusca += produtoTela.linhaProduto + "/";
              }
            }

            if (!produtoTela.tipoUnidade) {
              item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Tipo da Unidade")[0];
              if (item) {
                produtoTela.tipoUnidade = item.valorPropriedade;
                produtoTela.linhaBusca += produtoTela.tipoUnidade + "/";
              }
            }

            if (!produtoTela.voltagem) {
              item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Voltagem")[0];
              if (item) {
                produtoTela.voltagem = item.valorPropriedade;
                produtoTela.linhaBusca += produtoTela.voltagem + "/";
              }
            }

            if (!produtoTela.capacidade) {
              item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Capacidade (BTU/h)")[0];
              if (item) {
                produtoTela.capacidade = item.valorPropriedade;
                produtoTela.linhaBusca += produtoTela.capacidade + "/";
              }
            }
            produtoTela.linhaBusca += e.valorPropriedade + "/";
          });
          this.produtosTabela.push(produtoTela);
        }
      }
    });
    this.produtosTabelaApoio = this.produtosTabela;
  }

  filtrar(e: HTMLInputElement, tipo: string) {

    this.setarFiltros(tipo, e.value);
    this.filtrarProdutos();
  }

  setarFiltros(tipo: string, valor: string) {
    this.armazenaFiltro.forEach(x => {
      if (x.campo == tipo) {
        x.valor = !valor ? "" : valor;
      }
    });
  }

  filtrarProdutos() {
    let temFiltro: boolean = false;
    this.produtosTabela = new Array<ProdutoTabela>();
    this.produtosTabela = this.produtosTabelaApoio;
    let filter = this.armazenaFiltro.filter(x => x.valor != "");

    filter.forEach(x => {
      if (x.valor) {
        temFiltro = true;
        let produtos: ProdutoTabela[] = new Array<ProdutoTabela>();

        produtos = this.produtosTabela.filter(f => f.linhaBusca.includes(x.valor));
        if (produtos.length > 0) {
          this.produtosTabela = new Array<ProdutoTabela>();
          produtos.forEach(p => this.produtosTabela.push(p));
        }
        else {
          this.produtosTabela = new Array<ProdutoTabela>();
        }
      }
    });

    if (!temFiltro && this.produtosTabela.length == 0) {
      this.produtosTabela = this.produtosTabelaApoio;
    }
  }

  visualizarClick(id: number) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }
}

export class ProdutoTabela {
  id: string;
  linhaBusca: string;
  produto: string;
  fabricante: string;
  descricao: string;
  linhaProduto: string;
  tipoUnidade: string;
  voltagem: string;
  capacidade: string;

}
