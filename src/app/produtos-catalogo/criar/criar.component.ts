import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { ProdutoCatalogo } from '../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoCriarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent,
    ) { }

    public form: FormGroup;
    public mensagemErro: string = "*Campo obrigatório.";
    public produto: ProdutoCatalogo = new ProdutoCatalogo();
    public uploadedFiles: any[] = [];
    carregando: boolean = false;

    ngOnInit(): void {
      this.carregando = true;
      this.criarForm();
    }

    criarForm() {
      this.form = this.fb.group({
        id: ['', [Validators.required]],
        descricao: ['', [Validators.required]],
        ativo: [''],
      });
    }

    voltarClick(): void {
      this.router.navigate(["//produtos-catalogo/listar"]);
    }

    salvarClick() {
      if (!this.validacaoFormGroup.validaForm(this.form)){
        return;
      } 
      
      let prod = new ProdutoCatalogo();
      prod.id = this.form.controls.id.value;
      prod.nome = this.form.controls.descricao.value;
      prod.descricao = this.form.controls.descricao.value;
      prod.ativo = "true";
      prod.campos = [];
      prod.imagens = [];

      console.log(prod.id);
      console.log(prod.descricao);

      this.produtoService.criarProduto(prod).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Produto criado com sucesso!");
          this.router.navigate([`//produtos-catalogo/editar/${prod.id}`]);
        }
      }).catch((r)=> this.alertaService.mostrarErroInternet(r));
    }

}

