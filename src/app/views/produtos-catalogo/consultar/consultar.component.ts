import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
export class ProdutosCatalogoConsultarComponent implements OnInit, AfterViewInit {

  constructor(private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  produtosPropriedadesAtivos: ProdutoCatalogoItemProdutosAtivosDados[];
  cols: any[];
  carregando: boolean = false;
  stringUtils = StringUtils;

  ngOnInit(): void {
    this.carregando = true;
    this.criarTabela();
    this.buscarPropriedadesProdutosAtivos();
    this.buscarPropriedadesEOpcoesProdutosAtivos();
  }

  async ngAfterViewInit() {

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
        this.produtosPropriedadesAtivos = r;
        this.criarColunas();
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }



  buscarPropriedadesEOpcoesProdutosAtivos() {
    this.produtoService.buscarPropriedadesEOpcoesProdutosAtivos().toPromise().then((r) => {
      if (r != null) {
        this.montarFilrosDropDowns(r)
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }
  drops: any[] = new Array<any>();
  montarFilrosDropDowns(proprieadades: any[]) {
    
    let p  = new Array<any>();
    p = proprieadades;

    let map = proprieadades.map(x => x.IdProdpriedade);
    let filtrado: any[] = map.filter(this.distinct);

    filtrado.forEach(x => {
      
      let filtro = proprieadades.filter(y => y.IdProdpriedade == x);
      let prop = {item: filtro[0].NomePropriedade , values:[]};
      if(prop.item != "Incluir na calculadora VRF"){
        prop.values[0] = "Selecione";
        filtro.forEach(f=> {
          prop.values.push(f.ValorPropriedadeOpcao)
        });
        this.drops.push(prop)
      }
    });
  }

  private distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }
  produtosTela = new Array<ProdutoTabela>();
  criarColunas() {
    
    let filtrado = this.produtosPropriedadesAtivos.map(x => x.produto);
    let r: string[] = filtrado.filter(this.distinct);

    r.forEach(x => {
      let pp = this.produtosPropriedadesAtivos.filter(y => y.produto == x);
      let existe = this.produtosTela.filter(f => f.produto == x);
      if (existe.length == 0) {
        if (pp && pp.length > 0) {
          let produtoTela = new ProdutoTabela();
          produtoTela.produto = pp[0].produto;
          produtoTela.fabricante = pp[0].fabricante + " " + pp[0].fabricanteNome;
          produtoTela.descricao = pp[0].descricao;

          pp.forEach(e => {
            let item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Linha de Produto")[0];
            if (item) produtoTela.linhaProduto = item.valorPropriedade;

            item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Tipo da Unidade")[0];
            if (item) produtoTela.tipoUnidade = item.valorPropriedade;

            item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Voltagem")[0];
            if (item) produtoTela.voltagem = item.valorPropriedade;

            item = this.produtosPropriedadesAtivos.filter(x => x.produto == e.produto && x.nomePropriedade == "Capacidade (BTU/h)")[0];
            if (item) produtoTela.capacidade = item.valorPropriedade;


          });
          this.produtosTela.push(produtoTela);
        }
      }

    });
  }
}

export class ProdutoTabela {
  produto: string;
  fabricante: string;
  descricao: string;
  linhaProduto: string;
  tipoUnidade: string;
  voltagem: string;
  capacidade: string;
}