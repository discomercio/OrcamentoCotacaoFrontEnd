import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoPropriedade } from '../../dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoPropriedadesCriarComponent implements OnInit {

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
    public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
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
      this.router.navigate(["//produtos-catalogo-propriedades/listar"]);
    }

    salvarClick() {       
      
        let prod = new ProdutoCatalogoPropriedade();
        //prod.Id = this.form.controls.id.value;
        prod.descricao = this.form.controls.descricao.value;
        prod.usuario_cadastro = 'SISTEMA';
        
      this.produtoService.criarPropriedades(prod).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Propriedade criada com sucesso!");
            this.router.navigate(["//produtos-catalogo-propriedades/listar"]);
            //this.router.navigate([`//produtos-catalogo-propriedades/editar/${prod.Id}`]);
        }
      }).catch((r)=> this.alertaService.mostrarErroInternet(r));
    }

}

