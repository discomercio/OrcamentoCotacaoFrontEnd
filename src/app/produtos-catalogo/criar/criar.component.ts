import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoCriarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
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
      if (!this.validacaoFormularioService.validaForm(this.form)){
        return;
      } 
      
      let prod = new ProdutoCatalogo();
      prod.Id = this.form.controls.id.value;
      prod.Nome = "";
      prod.Descricao = this.form.controls.descricao.value;
      prod.Ativo = "true";
      prod.campos = [];
      prod.imagens = [];

      this.produtoService.criarProduto(prod).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Produto criado com sucesso!");
          this.router.navigate([`//produtos-catalogo/editar/${prod.Id}`]);
        }
      }).catch((r)=> this.alertaService.mostrarErroInternet(r));
    }

}

