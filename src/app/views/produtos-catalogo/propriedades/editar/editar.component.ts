import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';

import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class ProdutosCatalogoPropriedadesEditarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService) { }

    public form: FormGroup;
    public mensagemErro: string = "*Campo obrigatório.";
    public produtoPropriedade: ProdutoCatalogoPropriedade = new ProdutoCatalogoPropriedade();
    private id: number;
    public boolAtivo: boolean;
    carregando: boolean = false;
    @ViewChild("descricao") descricao: ElementRef;

    @ViewChild("ativo") ativo: ElementRef;

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.id = this.activatedRoute.snapshot.params.id;
    this.buscarPropriedadesPorId();
  }

  criarForm() {
    this.form = this.fb.group({
      id: [''],
      descricao: [''],
      ativo: [''],
    });
  }

    buscarPropriedadesPorId() {
      this.produtoService.buscarPropriedadesPorId(this.id).toPromise().then((r) => {
          if (r != null) {
              this.produtoPropriedade = r;
              this.descricao.nativeElement.value = r[0]['descricao'];
              this.boolAtivo = !r[0]['oculto'];
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  voltarClick(): void {
    this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
  }

    ativoClick(e) {
        this.produtoPropriedade.ordem = e.checked;
    }

    salvarClick() {

        let prod = new ProdutoCatalogoPropriedade();
        prod.descricao = this.descricao.nativeElement.value;
        prod.usuario_cadastro = 'SISTEMA';
        prod.id = this.id;
        prod.oculto = !this.boolAtivo;

        this.produtoService.atualizarPropriedades(prod).toPromise().then((r) => {
            if (r != null) {
                this.mensagemService.showSuccessViaToast("Propriedade atualizada com sucesso!");
                this.router.navigate(["//produtos-catalogo/propriedades/listar"]);
            }
        }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }

}

