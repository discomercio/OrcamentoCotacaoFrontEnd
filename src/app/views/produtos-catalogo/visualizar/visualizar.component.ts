import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Product } from 'src/app/demo/domain/product';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutosAtivosRequestViewModel } from 'src/app/dto/produtos-catalogo/ProdutosAtivosRequestViewModel';

@Component({
  selector: 'app-visualizar-produto',
  templateUrl: './visualizar.component.html',
  styleUrls: ['./visualizar.component.scss']
})
export class ProdutosCatalogoVisualizarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
  ) { }

  public form: FormGroup;
  public produto: ProdutoCatalogo = new ProdutoCatalogo();
  private id: number;
  private imgUrl: string;
  products: Product[];
  images: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.setarCampos();
    this.buscarProdutoDetalhe();
    this.buscarProduto()
  }

  criarForm() {
    this.form = this.fb.group({
      id: [''],
      descricao: ['', [Validators.required]],
      ativo: ['']
    });
  }

  setarCampos() {
    this.imgUrl = this.produtoService.imgUrl;
    this.id = this.activatedRoute.snapshot.params.id;
    console.log(this.id);
    this.form.controls.ativo.setValue(this.produto.Ativo);
  }

  buscarProdutoDetalhe() {
    this.produtoService.buscarProdutoDetalhe(this.id).toPromise().then((r) => {
      if (r != null) {
        this.produto = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  voltarClick(): void {
    window.history.back();
    // this.router.navigate(["//produtos-catalogo/listar"]);
  }

  produtoDados: ProdutoCatalogoItemProdutosAtivosDados[];

  buscarProduto() {
    let obj: ProdutosAtivosRequestViewModel = new ProdutosAtivosRequestViewModel();
    obj.idProduto = this.id;
    this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((r) => {
      if (r != null) {
        this.produtoDados = r;
      }
    }).catch((e) => {
      console.log(e);
    });
  }
}

