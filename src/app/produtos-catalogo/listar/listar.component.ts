import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';

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
  cols: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    this.criarTabela();
    this.buscarTodosProdutos();
  }

  criarTabela() {
    this.cols = [
      { field: "Id", header: "Código", visible: true },
      { field: "Descricao", header: "Descrição", visible: true },
      { field: "Ativo", header: "Ativo", visible: true },
      { field: "Acoes", header: "Ações", visible: true }
    ]
  }

  buscarTodosProdutos() {
    this.service.buscarTodosProdutos().toPromise().then((r) => {
      if (r != null) {
        this.listaProdutoDto = r;
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  visualizarClick(id: any) {
     this.router.navigate(["/produtos-catalogo/visualizar", id]);
  }

  editarClick(id: any) {
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

}

