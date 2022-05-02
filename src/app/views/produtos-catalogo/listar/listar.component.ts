import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { Filtro } from 'src/app/dto/orcamentos/filtro';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoListarComponent implements OnInit {

  constructor(private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ProdutoCatalogo[];
  listaProdutoDtoApoio: ProdutoCatalogo[];
  cols: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    // this.criarTabela();
    this.buscarTodosProdutos();
  }

  // criarTabela() {
  //   this.cols = [
  //     { field: "linhaBusca", header: "LinhaBusca", visible: true },
  //     { field: "Codigo", header: "Código", visible: true },
  //     { field: "Descricao", header: "Descrição", visible: true },
  //     { field: "Ativo", header: "Ativo", visible: true },
  //     { field: "Acoes", header: "Ações", visible: true }
  //   ]
  // }

  buscarTodosProdutos() {
    this.service.buscarTodosProdutos().toPromise().then((r) => {
      if (r != null) {
        this.listaProdutoDto = r;
        this.listaProdutoDtoApoio = this.listaProdutoDto;
        this.montarCampoTexto();
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  montarCampoTexto() {
    this.listaProdutoDto.forEach(x => {
      x.linhaBusca = x.Id + "/";
      x.linhaBusca += x.Produto + "/";
      x.linhaBusca = x.Fabricante + "/";
      x.linhaBusca = x.Nome + "/";
      x.linhaBusca = x.Descricao + "/";
    });
  }

  visualizarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

  editarClick(id: any) {
    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  copiarClick(id: any) {

    this.router.navigate(["/produtos-catalogo/editar", id]);
  }

  excluirClick(id: any) {
    this.service.excluirProduto(id).toPromise().then((r) => {
      if (r != null && r == true) {
        this.mensagemService.showSuccessViaToast("Produto inativado com sucesso!");
        this.carregando = false;
        this.buscarTodosProdutos();
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  criarClick() {
    this.router.navigate(["/produtos-catalogo/criar"]);
  }

  produtoFiltro: string;
  fabricanteFiltro: string;
  nomeFiltro: string;
  descriacaoFiltro: string;
  filtrar() {
    this.listaProdutoDto = this.listaProdutoDtoApoio;

    let p: ProdutoCatalogo = new ProdutoCatalogo();

    if (this.produtoFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Produto.toLowerCase().includes(this.produtoFiltro.toLowerCase()));
    if (this.fabricanteFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Fabricante.toLowerCase().includes(this.fabricanteFiltro.toLowerCase()));
    if (this.nomeFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Nome.toLowerCase().includes(this.nomeFiltro.toLowerCase()));
    if (this.descriacaoFiltro)
      this.listaProdutoDto = this.listaProdutoDto.filter(x => x.Descricao.toLowerCase().includes(this.descriacaoFiltro.toLowerCase()));
  }
}

