import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaProdutoDto } from 'src/app/dto/produtos/ListaProdutoDto';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-produtos',
  templateUrl: './lista-produtos.component.html',
  styleUrls: ['./lista-produtos.component.scss']
})
export class ListaProdutosComponent implements OnInit {

  constructor(private readonly produtoService: ProdutoService,
    private fb: FormBuilder,
    private readonly router: Router) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaProdutoDto: ListaProdutoDto[];
  cols: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.criarTabela();
    this.buscarTodosProdutos();
  }

  criarForm() {
    this.form = this.fb.group({
      codigoFabricanteProduto: [''],
      categoria: [''],
      capacidade: [''],
      ciclo: [''],
      voltagem: ['']
    });
  }

  criarTabela() {
    this.cols = [
      { field: "Descricao", header: "Descrição" },
      { field: "Categoria", header: "Categoria" },
      { field: "Ativo", header: "Ativo" },
      { field: "Acoes", header: "Ações" }
    ]
  }

  buscarTodosProdutos() {
    this.produtoService.buscarTodosProdutos().toPromise().then((r) => {
      if (r != null) {
        this.listaProdutoDto = r;
        this.carregando = false;
      }
    })
  }

  visualizarProduto(event: HTMLElement) {
    let produto: string = event.getElementsByTagName('input')[0].value;
    let prod = this.listaProdutoDto.filter(f => f.Produto == produto)[0];
    console.log(prod);
    this.router.navigate(["/produtos/visualizar-produto/visualizar-produto", prod.Fabricante, prod.Produto]);
  }

  formatarDescrcao(linha: ListaProdutoDto) {
    let texto: string = linha.FabricanteNome + " - " + linha.Fabricante + "/" + linha.Produto + " - " + linha.Descricao_Html;
    return texto;
  }


}
