import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';

import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';

@Component({
  selector: 'app-listar-produtos',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ProdutosCatalogoPropriedadesListarComponent implements OnInit {

  constructor(private readonly service: ProdutoCatalogoService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  listaPropriedadesProdutoDto: ProdutoCatalogoPropriedade[];
  cols: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    this.criarTabela();
    this.buscarTodosProdutos();
  }

  criarTabela() {
    this.cols = [
      { field: "Descricao", header: "Descrição", visible: true },
      { field: "Ativo", header: "Ativo", visible: true },
      { field: "Acoes", header: "Ações", visible: true }
    ]
  }

  buscarTodosProdutos() {
      this.service.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.listaPropriedadesProdutoDto = r;
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  editarClick(id: any) {
      this.router.navigate(["/produtos-catalogo/propriedades/editar", id]);
  }


  criarClick() {
    this.router.navigate(["/produtos-catalogo/propriedades/criar"]);
  }

}

