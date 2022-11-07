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
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { SelectItem } from 'primeng/api';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutoCatalogoImagem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoImagem';
import { ProdutosAtivosRequestViewModel } from 'src/app/dto/produtos-catalogo/ProdutosAtivosRequestViewModel';

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
  public produtoDetalhe: ProdutoCatalogo = new ProdutoCatalogo();
  public produto: ProdutoCatalogoItemProdutosAtivosDados[] = new Array<ProdutoCatalogoItemProdutosAtivosDados>()
  public propriedade: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  public propriedade_opcoes: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  private id: number;
  private imgUrl: string;
  public urlUpload: string;
  public uploadedFiles: any[] = [];
  carregando: boolean = false;

  propriedades: ProdutoCatalogoPropriedade[] = new Array<ProdutoCatalogoPropriedade>();
  opcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstOpcoes: SelectItem[][] = [];

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.setarCampos();
    this.buscarProdutoDetalhe();
    this.buscarOpcoes();
  }

  criarForm() {
    this.form = this.fb.group({
      id: [this.produtoDetalhe.Id],
      produto: [this.produtoDetalhe.Produto, [Validators.required]],
      descricao: [this.produtoDetalhe.Descricao, [Validators.required]],
      ativo: [this.produtoDetalhe.Ativo],
      fabricante: [this.produtoDetalhe.Fabricante, [Validators.required]],
      nome: [this.produtoDetalhe.Descricao, [Validators.required]]
    });
  }

  setarCampos() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.imgUrl = this.produtoService.imgUrl;
    this.urlUpload = this.produtoService.urlUpload;
  }

  consolidarLista(produtoCat: ProdutoCatalogoItemProdutosAtivosDados[]) {
    produtoCat.forEach(x => {
      this.produto.push(x);
    });
  }

  buscarProdutoDetalhe() {
    let obj: ProdutosAtivosRequestViewModel = new ProdutosAtivosRequestViewModel();
    obj.idProduto = this.id;
    this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((r) => {

      this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((y) => {
        if (r != null) {
          //   this.produto = r;
          this.consolidarLista(r);
          this.consolidarLista(y);
          this.buscarPropriedades();
        }
      }).catch((e) => {
        console.log(e);
      });
    }).catch((e) => {
      console.log(e);
    });

    this.produtoService.buscarProdutoDetalhe(this.id).toPromise().then((r) => {
      if (r != null) {
        this.produtoDetalhe = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  propriedadesItem: ProdutoCatalogoItemProdutosAtivosDados[] = new Array<ProdutoCatalogoItemProdutosAtivosDados>();
  produtosParaTela: ProdutoCatalogoItemProdutosAtivosDados[] = new Array();

  montarListaProdutoParaTela() {

    this.propriedades.forEach(x => {

      let item = this.produto.filter(y => y.idPropriedade == x.id);

      let prod = new ProdutoCatalogoItemProdutosAtivosDados();
      prod.idPropriedade = x.id;
      prod.idTipoCampo = x.IdCfgTipoPropriedade;

      if (item.length == 0) {
        prod.valorPropriedade = "";
        prod.idValorPropriedadeOpcao = 0;
        prod.propriedadeOcultaItem = true;
        this.produtosParaTela.push(prod);
      }
      else {
        prod.valorPropriedade = item[0].valorPropriedade;
        prod.idValorPropriedadeOpcao = item[0].idValorPropriedadeOpcao;
        prod.propriedadeOcultaItem = item[0].propriedadeOcultaItem;
        this.produtosParaTela.push(prod);
      }
    });
  }

  buscarPropriedades() {
    this.produtoService.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.propriedades = r;
        this.montarListaProdutoParaTela();
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

            if (indice == listaId[x] && r[y]['oculto'] == false) {
              lstOpcoesPorId.push({ label: r[y]['valor'], value: r[y]['id'] });
            }
            y++;
          }

          this.lstOpcoes[listaId[x]] = lstOpcoesPorId;

          x++;
        }

      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  voltarClick(): void {
    if (this.validacaoFormularioService.validaForm(this.form)) {
    }
    this.router.navigate(["//produtos-catalogo/listar"]);
  }

  onChangeAtivo(idPropriedade: number, index: number) {
    this.produtosParaTela[index].propriedadeOcultaItem = !this.produtosParaTela[index].propriedadeOcultaItem;
  }

  excluirImagemClick(idImagem) {
    this.produtoService.excluirImagem(this.produtoDetalhe.Id, idImagem).toPromise().then((r) => {
      if (r != null) {
        this.alertaService.mostrarMensagem(r);
        return;
      }
      
      // for (var x = 0; x <= this.produtoDetalhe.imagens.length - 1; x++) {
      //   if (this.produtoDetalhe.imagens[x].Id == idImagem) {
      //     this.produtoDetalhe.imagens.splice(x, 1);
      //   }
      // }

      this.produtoDetalhe.imagem = null;
      this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r)
    });
  }

  atualizarProdutoClick() {

    let campos: ProdutoCatalogoItem[] = [];

    this.produtosParaTela.forEach(x => {
      if (
        x.idTipoCampo == 0 && x.valorPropriedade != null && x.valorPropriedade != "" ||
        x.idTipoCampo == 1 && x.idValorPropriedadeOpcao != null && x.idValorPropriedadeOpcao != 0
      ) {
        let itemModelo: ProdutoCatalogoItem = new ProdutoCatalogoItem();
        itemModelo.IdProdutoCatalogo = this.produtoDetalhe.Id;
        itemModelo.IdProdutoCatalogoPropriedade = x.idPropriedade.toString();
        itemModelo.Oculto = x.propriedadeOcultaItem ? "true" : "false";

        if (x.idTipoCampo == 0) { //TextBox
          itemModelo.IdProdutoCatalogoPropriedadeOpcao = null;
          itemModelo.Valor = x.valorPropriedade;
        } else {
          itemModelo.IdProdutoCatalogoPropriedadeOpcao = x.idValorPropriedadeOpcao == 0 ? x.valorPropriedade : x.idValorPropriedadeOpcao.toString();
          itemModelo.Valor = null;
          console.log(x);
        }

        campos.push(itemModelo);
      }
    });

    let produto = new ProdutoCatalogo();
    produto.Id = this.produtoDetalhe.Id;
    produto.Nome = this.produtoDetalhe.Nome; //Descricao
    produto.Descricao = this.produtoDetalhe.Descricao; //Descricao Completa
    produto.Ativo = this.produtoDetalhe.Ativo;
    produto.campos = campos;
    if (!!this.imagem) {
      produto.imagem = new ProdutoCatalogoImagem();
      produto.imagem = this.imagem;
    }

    let formData = new FormData();
    if (!!this.arquivo)
      formData.append("arquivo", this.arquivo, this.arquivo.name);

    formData.append("produto", JSON.stringify(produto));

    this.produtoService.atualizarProduto(formData).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showErrorViaToast([r]);
        return;
      }

      this.mensagemService.showSuccessViaToast("Atualizado com sucesso!");
      this.router.navigate(["//produtos-catalogo/listar"]);
    }).catch((r) => this.alertaService.mostrarErroInternet(r));


  }

  lstPropriedades: any = [];

  onChange(idProdutoCatalogoPropriedade, idProdutoCatalogoPropriedadeOpcao, idCfgTipoPropriedade, valor) {
    if (this.lstPropriedades.find((test) => test.idPropriedade === idProdutoCatalogoPropriedade) === undefined) {
      this.lstPropriedades.push(
        {
          IdProdutoCatalogoPropriedade: idProdutoCatalogoPropriedade,
          IdProdutoCatalogoPropriedadeOpcao: idProdutoCatalogoPropriedadeOpcao.value,
          IdCfgTipoPropriedade: idCfgTipoPropriedade,
          Valor: valor
        });
    }
  }

  imagem: ProdutoCatalogoImagem;
  setarDadosImagem(arquivo: any): void {
    let img = new ProdutoCatalogoImagem();
    img.IdProdutoCatalogo = "-1";
    img.IdIipoImagem = 1;
    img.Caminho = arquivo.name;
    img.Ordem = "200";

    this.imagem = img;
  }

  arquivo: File;
  onSelectFile(event) {
    let arquivo = event.files[0];
    this.arquivo = arquivo;
    this.setarDadosImagem(arquivo);
  }
}

