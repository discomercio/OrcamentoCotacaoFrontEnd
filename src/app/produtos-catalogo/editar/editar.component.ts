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
    public readonly validacaoFormGroup: ValidacaoFormularioComponent,
    ) { }

    public form: FormGroup;
    public mensagemErro: string = "*Campo obrigatório.";
    public produto: ProdutoCatalogo = new ProdutoCatalogo();
    private id: string;
    private imgUrl: string;
    public urlUpload: string;
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
      descricao: [''],
      ativo: [''],
    });
  }

  setarCampos() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.imgUrl = this.produtoService.imgUrl;
    this.urlUpload = this.produtoService.urlUpload;
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
    this.produto.Ativo = e.checked;
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
    this.produtoService.excluirImagem(this.produto.Id, idImagem).toPromise().then((r) => {
      if (r != null) {
        for(var x = 0; x <= this.produto.imagens.length -1; x++) {
          if(this.produto.imagens[x].Id == idImagem) {
            this.produto.imagens.splice(x, 1);
          }
        }

        this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

  atualizarProdutoClick() {
    var txtDescricao = (<HTMLInputElement>document.getElementById("descricao"));

    if (txtDescricao.value == ""){
      this.mensagemService.showWarnViaToast("Campo [Descrição] é obrigatório!");
      return;
    }

    var input = document.getElementsByTagName("input");
    var inputList = Array.prototype.slice.call(input);
    let tmp = new  ProdutoCatalogoCampo();
    //prod.nome = this.form.controls.nome.value;
    this.produto.Descricao = txtDescricao.value; //this.form.controls.descricao.value;
    this.produto.Ativo = this.form.controls.ativo.value;
    this.produto.campos = [];

    inputList.forEach(e => {
      tmp = new ProdutoCatalogoCampo();

      if(e.id.startsWith('item') && e.value != ""){

        tmp.Id = e.id.substring(4, e.id.length);
        tmp.Codigo = e.codigo;
        tmp.Chave = e.chave;
        tmp.Valor = e.value;
        tmp.Ordem = e.ordem;

        this.produto.campos.push(JSON.parse(JSON.stringify(tmp)));
      }
    });

    this.produtoService.atualizarProduto(this.produto).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Dados atualizados com sucesso!");
        this.router.navigate(["//produtos-catalogo/listar"]);
      }
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));
  }

}

