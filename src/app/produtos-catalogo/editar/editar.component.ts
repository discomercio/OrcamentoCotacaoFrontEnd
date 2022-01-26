import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { ProdutoCatalogo } from '../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoCampo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoCampo';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class ProdutosCatalogoEditarComponent implements OnInit {

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
    private id: string;
    private imgUrl: string;
    private urlUpload: string;
    public uploadedFiles: any[] = [];
    carregando: boolean = false;

  ngOnInit(): void {
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
    this.id = this.activatedRoute.snapshot.params.id;
    this.imgUrl = this.produtoService.imgUrl;
    this.urlUpload = this.produtoService.urlUpload;
    this.form.controls.descricao.setValue(this.produto.descricao);
    this.form.controls.ativo.setValue(this.produto.ativo);
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

  ativoClick(e) {
    this.produto.ativo = e.checked;
  }

  onBeforeUpload(event) {
    console.log('onBeforeUpload');
    event.formData.append('idProdutoCalatogo', this.id);
  }
   onUpload(event, fileUpload){
    console.log('onUpload');

    this.ngOnInit();
    this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");
  }
  
  excluirImagemClick(idImagem) {
    this.produtoService.excluirImagem(this.produto.id, idImagem).toPromise().then((r) => {
      if (r != null) {
        for(var x = 0; x <= this.produto.imagens.length -1; x++) {
          if(this.produto.imagens[x].id == idImagem) {
            this.produto.imagens.splice(x, 1);
          }
        }

        this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

  atualizarProdutoClick() {
    // if (!this.validacaoFormGroup.validaForm(this.form)){
    //   this.mensagemService.showWarnViaToast("Campo [Descrição] é obrigatório!");
    //   return;
    // } 
    
    let tmp = new  ProdutoCatalogoCampo();

    let prod = new ProdutoCatalogo();
    prod.id = this.produto.id;
    //prod.nome = "nome"; //this.produto.nome;
    prod.descricao = this.produto.descricao;
    prod.ativo = this.produto.ativo;
    prod.campos = [];

    var input = document.getElementsByTagName("input");
    var inputList = Array.prototype.slice.call(input);

    inputList.forEach(e => {
      tmp = new ProdutoCatalogoCampo();

      if(e.id.startsWith('item') && e.value != ""){

        tmp.id = e.id.substring(4, e.id.length);
        tmp.codigo = e.codigo;
        tmp.chave = e.chave;
        tmp.valor = e.value;
        tmp.ordem = e.ordem;

        prod.campos.push(JSON.parse(JSON.stringify(tmp)));
      }
    });

    this.produtoService.atualizarProduto(prod).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Dados atualizados com sucesso!");
        this.router.navigate(["//produtos-catalogo/listar"]);
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

}

