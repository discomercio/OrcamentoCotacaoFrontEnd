import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Product } from 'src/app/demo/domain/product';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutosAtivosRequestViewModel } from 'src/app/dto/produtos-catalogo/ProdutosAtivosRequestViewModel';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

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
    private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

  public form: FormGroup;
  public produto: ProdutoCatalogo = new ProdutoCatalogo();
  private id: number;
  private imgUrl: string;
  products: Product[];
  images: any[];
  carregando: boolean = false;

  ngOnInit(): void {
    
    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoConsultar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

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
  }

  produtoDados: ProdutoCatalogoItemProdutosAtivosDados[];

  buscarProduto() {
    let obj: ProdutosAtivosRequestViewModel = new ProdutosAtivosRequestViewModel();
    obj.idProduto = this.id;
    obj.propriedadeOculta= false;
    obj.propriedadeOcultaItem = false;
    this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((r) => {
      if (r != null) {
        this.produtoDados = r;
      }
    }).catch((e) => {
      console.log(e);
    });
  }

  ngOnDestroy(){
    
    let url = this.router.url;
    if(url.indexOf("/produtos-catalogo/consultar") == -1) {
      sessionStorage.removeItem("filtro");
    }
  }
}

