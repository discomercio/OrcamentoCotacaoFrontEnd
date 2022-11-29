import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HasElementRef } from '@angular/material/core/typings/common-behaviors/color';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { ProdutoCatalogo } from 'src/app/dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoImagem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoImagem';
import { ProdutoCatalogoItem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoItem';
import { ProdutoCatalogoPropriedade } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutosAtivosRequestViewModel } from 'src/app/dto/produtos-catalogo/ProdutosAtivosRequestViewModel';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-clonar',
  templateUrl: './clonar.component.html',
  styleUrls: ['./clonar.component.scss']
})
export class ProdutosCatalogoClonarComponent implements OnInit, AfterViewInit {

  constructor(private fb: FormBuilder,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly autenticacaoService: AutenticacaoService) { }

  carregando: boolean = false;
  form: FormGroup;
  produtoDetalhe: ProdutoCatalogo = new ProdutoCatalogo();
  id: number;
  imgUrl: string;
  urlUpload: string;
  opcoes: ProdutoCatalogoPropriedadeOpcao[];
  produto: ProdutoCatalogoItemProdutosAtivosDados[] = new Array<ProdutoCatalogoItemProdutosAtivosDados>()
  propriedades: ProdutoCatalogoPropriedade[] = new Array<ProdutoCatalogoPropriedade>();
  lstOpcoes: SelectItem[][] = [];
  mensagemErro: string = "*Campo obrigatório.";
  produtosParaTela: ProdutoCatalogoItemProdutosAtivosDados[] = new Array();
  lstFabricantes: SelectItem[] = [];
  fabricantes: ProdutoCatalogoFabricante[];

  @ViewChild("codigo") codigo: ElementRef;
  
  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.carregando = true;
    this.criarForm();
    this.setarCampos();
    this.buscarProdutoDetalhe();
    this.buscarFabricantes();
    this.urlUpload = this.produtoService.urlUpload;
    this.imgUrl = this.produtoService.imgUrl;
  }

  ngAfterViewInit(){
    setTimeout(() => {
    this.codigo.nativeElement.focus();
    }, 500);
  }

  criarForm() {
    this.form = this.fb.group({
      descricao: [this.produtoDetalhe.Descricao, [Validators.required]],
      nome_produto: [this.produtoDetalhe.Nome, [Validators.required]],
      produto: ['', [Validators.required]],
      fabricante: [this.produtoDetalhe.Fabricante, [Validators.required]],
      ativo: [''],
    });
  }

  setarCampos() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.imgUrl = this.produtoService.imgUrl;
    this.urlUpload = this.produtoService.urlUpload;
  }

  buscarProdutoDetalhe() {
    let obj: ProdutosAtivosRequestViewModel = new ProdutosAtivosRequestViewModel();
    obj.idProduto = this.id;
    this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((r) => {

      this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise().then((y) => {
        if (r != null) {
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
        this.produtoDetalhe.Produto = "";
        this.produtoDetalhe.Fabricante = this.produtoDetalhe.Fabricante.split('-')[0].trim();
        if (this.produtoDetalhe.imagem) {
          this.imagem = new ProdutoCatalogoImagem();
          this.imagem.Caminho = this.produtoDetalhe.imagem.Caminho;
          this.imagem.Ordem = this.produtoDetalhe.imagem.Ordem;
        }
        this.criarForm();
      }
    }).catch((r) => this.sweetAlertService.aviso(r));
  }

  buscarOpcoes(): void {
    this.produtoService.buscarOpcoes().toPromise().then((r) => {
      if (r != null) {
        this.opcoes = r;
        this.carregando = false;
        let listaId = [];

        r.forEach(x => {
          listaId.push(Number.parseInt(x.id_produto_catalogo_propriedade));
        });

        listaId.forEach(x => {
          let opcao = r.filter(p => p.id_produto_catalogo_propriedade == x);

          let lstOpcoesPorId = [];
          if (opcao.length > 0) {
            opcao.forEach(o => {
              if (o.oculto) {
                let propriedadeProduto = this.produtosParaTela
                  .filter(p => p.idPropriedade == Number.parseInt(o.id_produto_catalogo_propriedade) &&
                    p.idValorPropriedadeOpcao == Number.parseInt(o.id));

                if (propriedadeProduto.length > 1) {
                  let pErro = this.propriedades.filter(prop => prop.id == propriedadeProduto[0].idPropriedade);
                  this.sweetAlertService.aviso(`Ops! existe uma inconsistência na propriedade: <br> <b>${pErro[0].descricao}</b>`);
                }
                if (propriedadeProduto.length > 0) {
                  lstOpcoesPorId.push({ label: o.valor, value: Number.parseInt(o.id) });
                }
              }
              else {
                lstOpcoesPorId.push({ label: o.valor, value: Number.parseInt(o.id) });
              }
            });
            if (lstOpcoesPorId.length > 0) {
              this.lstOpcoes[x] = lstOpcoesPorId;
            }
          }
        });
      }
    }).catch((r) => this.sweetAlertService.aviso(r));
  }

  consolidarLista(produtoCat: ProdutoCatalogoItemProdutosAtivosDados[]) {
    produtoCat.forEach(x => {
      this.produto.push(x);
    });
  }

  buscarPropriedades() {
    this.produtoService.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.propriedades = r;
        this.montarListaProdutoParaTela();
        this.carregando = false;
      }
    }).catch((r) => this.sweetAlertService.aviso(r));
  }

  montarListaProdutoParaTela() {

    this.propriedades.forEach(x => {

      let item = this.produto.filter(y => y.idPropriedade == x.id);

      let prod = new ProdutoCatalogoItemProdutosAtivosDados();
      prod.idPropriedade = x.id;
      prod.idTipoCampo = x.IdCfgTipoPropriedade;
      

      if (item.length == 0) {
        prod.idValorPropriedadeOpcao = 0;
        prod.valorPropriedade = "";
        prod.propriedadeOcultaItem = true;
        this.produtosParaTela.push(prod);
      }
      else {
        prod.idValorPropriedadeOpcao = item[0].idValorPropriedadeOpcao;
        prod.valorPropriedade = item[0].valorPropriedade;
        prod.propriedadeOcultaItem = item[0].propriedadeOcultaItem;
        this.produtosParaTela.push(prod);
      }
    });

    this.buscarOpcoes();
  }

  buscarFabricantes() {
    let lstFabricantes = [];
    var indice = 0;

    this.produtoService.buscarFabricantes().toPromise().then((r) => {
      if (r != null) {

        while (indice < r.length) {
          lstFabricantes.push({ label: r[indice]['Descricao'], value: r[indice]['Fabricante'] })
          indice++;
        }

        this.lstFabricantes = lstFabricantes;
        this.fabricantes = r;
        this.carregando = false;
      }
    }).catch((r) => this.sweetAlertService.aviso(r));
  }

  salvarClick() {

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }

    let campos: ProdutoCatalogoItem[] = [];

    this.produtosParaTela.forEach(x => {
      if (
        x.idTipoCampo == 0 && x.valorPropriedade != null && x.valorPropriedade != "" ||
        x.idTipoCampo == 1 && x.idValorPropriedadeOpcao != null && x.idValorPropriedadeOpcao != 0
      ) {
        let itemModelo: ProdutoCatalogoItem = new ProdutoCatalogoItem();
        itemModelo.IdProdutoCatalogo = '-1';
        itemModelo.IdProdutoCatalogoPropriedade = x.idPropriedade.toString();


        if (x.idTipoCampo == 1) {
          itemModelo.IdProdutoCatalogoPropriedadeOpcao = x.idValorPropriedadeOpcao == 0 ? x.valorPropriedade : x.idValorPropriedadeOpcao.toString();
          itemModelo.Valor = "";
        } else {

          itemModelo.IdProdutoCatalogoPropriedadeOpcao = '-1';
          itemModelo.Valor = x.valorPropriedade;
        }
        debugger;
        itemModelo.Oculto = x.propriedadeOcultaItem ? true : false;
        campos.push(itemModelo);
      }
    });

    let produto = new ProdutoCatalogo();
    produto.Produto = this.form.controls.produto.value;
    produto.Fabricante = this.form.controls.fabricante.value;
    produto.Nome = this.form.controls.nome_produto.value; //Descricao
    produto.Descricao = this.form.controls.descricao.value; //Descricao Completa
    produto.Ativo = this.form.controls.ativo.value;
    produto.campos = campos;
    debugger;
    if (this.imagem != null) {
      produto.imagem = new ProdutoCatalogoImagem();
      produto.imagem = this.imagem;
    }

    this.produtoService.buscarPorCodigo(this.form.controls.produto.value).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showWarnViaToast(`Código [${this.form.controls.produto.value}] já foi cadastrado!`);
        return;
      } else {
        let formData = new FormData();
        if (!!this.arquivo)
          formData.append("arquivo", this.arquivo, this.arquivo.name);

        formData.append("produto", JSON.stringify(produto));
        this.produtoService.criarProduto(formData).toPromise().then((r) => {
          if (r != null) {
            this.mensagemService.showSuccessViaToast("Produto criado com sucesso!");
            this.router.navigate(["//produtos-catalogo/listar"]);
          }
        }).catch((r) => {
          this.sweetAlertService.aviso(r);
        });
      }
    }).catch((e) => {
      this.sweetAlertService.aviso(e);
    });

  }

  voltarClick(): void {
    this.router.navigate(["//produtos-catalogo/listar"]);
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

  excluirImagemClick(idImagem) {

    this.imagem = null;
    this.produtoDetalhe.imagem = null;

    this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
  }

  arquivo: File;
  onSelectFile(event) {
    let arquivo = event.files[0];
    this.arquivo = arquivo;
    this.setarDadosImagem(arquivo);
  }

  digitouCodigo(event: Event) {
    let valor = ((event.target) as HTMLInputElement).value;

    if (isNaN(Number(valor))) {
      let limpando = valor.replace(/[^0-9]/g, '');
      this.form.controls.produto.setValue(limpando);
      return;
    }

    if (valor == "0") {
      this.form.controls.produto.setValue("");
      return;
    }

    let valorInteiro = Number.parseInt(valor);
    if (valorInteiro.toString().length > 6) return;

    valor = ("00000" + valor).slice(-6);
    if(Number.parseInt(valor) == 0){
      this.form.controls.produto.setValue("");
      return
    }

    this.form.controls.produto.setValue(valor.toString());
  }

  onChangeAtivo(idPropriedade: number, index: number) {
    this.produtosParaTela[index].propriedadeOcultaItem = !this.produtosParaTela[index].propriedadeOcultaItem;
  }
}
