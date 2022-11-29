import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Product } from 'src/app/demo/domain/product';

import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-visualizar-produto',
  templateUrl: './visualizar.component.html',
  styleUrls: ['./visualizar.component.scss']
})
export class ProdutosCatalogoPropriedadesVisualizarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService) { }

    public form: FormGroup;
    public produto: ProdutoCatalogo = new ProdutoCatalogo();
    private id: string;
    private imgUrl: string;
    products: Product[];
    images: any[];
    carregando: boolean = false;

    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    ngOnInit(): void {

      if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoPropriedadeConsultar)) {
        this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
        window.history.back();
        return;
      }

      this.carregando = true;
      this.criarForm();
      this.setarCampos();
      this.buscarProdutoDetalhe();
    }

    criarForm() {
      this.form = this.fb.group({
        id: [''],
        descricao: ['', [Validators.required]],
        ativo: [''],
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
      }).catch((r)=> this.alertaService.mostrarErroInternet(r));
    }

    voltarClick(): void {
      this.router.navigate(["//produtos-catalogo/listar"]);
    }

}

