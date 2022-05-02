import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoPropriedade } from '../../../dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoPropriedadeOpcao } from '../../../dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoCatalogoItem } from '../../../dto/produtos-catalogo/ProdutoCatalogoItem';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ProdutoCatalogoCampo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoCampo';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { SelectItem } from 'primeng/api';

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
    public readonly validacaoFormularioService: ValidacaoFormularioService) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produto: ProdutoCatalogo = new ProdutoCatalogo();
  public propriedade: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  public propriedade_opcoes: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  private id: string;
  private imgUrl: string;
  public urlUpload: string;
  public uploadedFiles: any[] = [];
  carregando: boolean = false;

  propriedades: ProdutoCatalogoPropriedade[];
  opcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstOpcoes: SelectItem[][] = [];

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.setarCampos();
    this.buscarProdutoDetalhe();
    this.buscarPropriedades();
    this.buscarOpcoes();

    console.log(this.produto.imagens)
    console.log(this.produto.imagens[0].Caminho)
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
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarPropriedades() {
    this.produtoService.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.propriedades = r;
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarOpcoes(): void {

    this.produtoService.buscarOpcoes().toPromise().then((r) => {

      var x = 0;
      var y = 0;

      if (r != null) {
        this.opcoes = r;
        this.carregando = false;

        let lstOpcoesPorId = [];
        let listaId = [];

        while (x < r.length) {

          if (listaId.indexOf(r[x]['id_produto_catalogo_propriedade']) === -1) {
            listaId.push(r[x]['id_produto_catalogo_propriedade']);
          }
          x++;
        }

        x = 0;

        while (x < listaId.length) {
          var y = 0;

          lstOpcoesPorId = [];

          while (y < r.length) {
            var indice = parseInt(r[y]['id_produto_catalogo_propriedade']);

            if (indice == x) {
              lstOpcoesPorId.push({ label: r[y]['valor'], value: r[y]['id'] });
            }
            y++;
          }
          this.lstOpcoes[x] = lstOpcoesPorId;

          x++;
        }

      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
  onUpload(event, fileUpload) {
    console.log('onUpload');

    this.ngOnInit();
    this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");
  }

  excluirImagemClick(idImagem) {
    this.produtoService.excluirImagem(this.produto.Id, idImagem).toPromise().then((r) => {
      if (r != null) {
        for (var x = 0; x <= this.produto.imagens.length - 1; x++) {
          if (this.produto.imagens[x].Id == idImagem) {
            this.produto.imagens.splice(x, 1);
          }
        }

        this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  atualizarProdutoClick() {
    var txtDescricao = (<HTMLInputElement>document.getElementById("descricao"));

    if (txtDescricao.value == "") {
      this.mensagemService.showWarnViaToast("Campo [Descrição] é obrigatório!");
      return;
    }

    var input = document.getElementsByTagName("input");
    var inputList = Array.prototype.slice.call(input);
    let tmp = new ProdutoCatalogoCampo();
    //prod.nome = this.form.controls.nome.value;
    this.produto.Descricao = txtDescricao.value; //this.form.controls.descricao.value;
    this.produto.Ativo = this.form.controls.ativo.value;
    this.produto.campos = [];

    inputList.forEach(e => {
      tmp = new ProdutoCatalogoCampo();

      if (e.id.startsWith('item') && e.value != "") {

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
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

}

