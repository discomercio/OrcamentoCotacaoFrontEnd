import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';
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
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';

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

  buscarProdutosComFlag() { }
  buscarProdutoDetalhe() {
    // this.produtoService.buscarPropriedadesProdutoAtivo(this.id, false, false).toPromise().then((r) => {
    //   if (r != null) {
    //     // this.produto = r;
    //     this.consolidarLista(r);
    //     // this.criarObjeto();
    //   }
    // }).catch((e) => {
    //   console.log(e);
    // });
    this.produtoService.buscarPropriedadesProdutoAtivo(this.id, false, true).toPromise().then((r) => {


      this.produtoService.buscarPropriedadesProdutoAtivo(this.id, false, false).toPromise().then((y) => {
        if (r != null) {
          // this.produto = r;
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
  criarObjeto() {
    // this.propriedade.forEach(x => {
    //   this.produto
    // });
  }

  produtosParaTela: ProdutoCatalogoItemProdutosAtivosDados[] = new Array();
  montarListaProdutoParaTela() {
    this.propriedades.forEach(x => {

      let item = this.produto.filter(y => y.idPropriedade == x.id);
      if (item.length == 0) {
        let prod = new ProdutoCatalogoItemProdutosAtivosDados();
        prod.idPropriedade = x.id;
        prod.valorPropriedade = "";
        prod.idValorPropriedadeOpcao = 0;
        prod.propriedadeOcultaItem = true;
        this.produtosParaTela.push(prod);
      }
      else {
        let prod = new ProdutoCatalogoItemProdutosAtivosDados();
        prod.idPropriedade = item[0].id;
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

            if (indice == listaId[x]) {
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
    this.produtoService.excluirImagem(this.produtoDetalhe.Id, idImagem).toPromise().then((r) => {
      if (r != null) {
        for (var x = 0; x <= this.produtoDetalhe.imagens.length - 1; x++) {
          if (this.produtoDetalhe.imagens[x].Id == idImagem) {
            this.produtoDetalhe.imagens.splice(x, 1);
          }
        }

        this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  atualizarProdutoClick() {

    let idProduto = this.produtoDetalhe.Id;
    //Incluir os dados para t_PRODUTO_CATALOGO
    /*
        idProduto = produtoDetalhe.Id
        produto = produtoDetalhe.Produto
        fabricante(numero) = produtoDetalhe.Fabricante
        nome = produtoDetalhe.Nome
        descricao_completa = produtoDetalhe.Descricao
        ativo = produtoDetalhe.Ativo
        listaPropriedades = modelo

        *******************************************************************************************
        PARA SALVAR NA t_PRODUTO_CATALOGO_ITEM
        Dropar da t_PRODUTO_CATALOGO_ITEM todos registros com o ID_Produto
        Inserir todos as propriedades onde contém VALOR ou ID_da_OPCAO
        *******************************************************************************************
    */

    let modelo: ProdutoCatalogoItem[] = new Array();
    this.produtosParaTela.forEach(x => {

      if (x.valorPropriedade != null && x.valorPropriedade != "") {
        let itemModelo: ProdutoCatalogoItem = new ProdutoCatalogoItem();
        itemModelo.IdProdutoCatalogo = idProduto;
        itemModelo.IdProdutoCatalogoPropriedade = x.idPropriedade.toString();
        itemModelo.Oculto = x.propriedadeOcultaItem ? "1" : "0";

        if (x.idValorPropriedadeOpcao == 0) {
          itemModelo.IdProdutoCatalogoPropriedadeOpcao = null;
          itemModelo.Valor = x.valorPropriedade;
        } else {
          itemModelo.IdProdutoCatalogoPropriedadeOpcao = x.idValorPropriedadeOpcao.toString();
          itemModelo.Valor = null;
        }

        modelo.push(itemModelo);
      }
    });




    //REDIRECIONAR PARA A TELA DE LISTAGEM
  }


  lstPropriedades: any = [];
  onChange(idProdutoCatalogoPropriedade,
    idProdutoCatalogoPropriedadeOpcao,
    idCfgTipoPropriedade,
    valor) {

    // Verifico se já foi adicionado    
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
}

