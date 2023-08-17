import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';

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
    private readonly sweetAlertService: SweetalertService,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly autenticacaoService: AutenticacaoService) { }

  form: FormGroup;
  mensagemErro: string = "*Campo obrigatório.";
  produtoDetalhe: ProdutoCatalogo = new ProdutoCatalogo();
  produto: ProdutoCatalogoItemProdutosAtivosDados[] = new Array<ProdutoCatalogoItemProdutosAtivosDados>()
  propriedade: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  propriedade_opcoes: ProdutoCatalogoItem = new ProdutoCatalogoItem();
  id: number;
  imgUrl: string;
  urlUpload: string;
  uploadedFiles: any[] = [];
  carregando: boolean = false;
  fabricantes: ProdutoCatalogoFabricante[];
  propriedades: ProdutoCatalogoPropriedade[] = new Array<ProdutoCatalogoPropriedade>();
  opcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstOpcoes: SelectItem[][] = [];
  lojaLogada: string;
  imgSemImagem: ProdutoCatalogoImagem = new ProdutoCatalogoImagem();
  arquivo: File;
  propriedadesItem: ProdutoCatalogoItemProdutosAtivosDados[] = new Array<ProdutoCatalogoItemProdutosAtivosDados>();
  produtosParaTela: ProdutoCatalogoItemProdutosAtivosDados[] = new Array();
  lstPropriedades: any = [];
  imagem: ProdutoCatalogoImagem;

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.carregando = true;

    this.lojaLogada = this.autenticacaoService._lojaLogado;
    this.criarForm();
    this.setarCampos();

    let promises: any = [this.buscarFabricantes(), this.buscarPropriedadesProdutoAtivo(), this.buscarPropriedades(),
    this.buscarProdutosOpcoes(), this.buscarProdutoDetalhe()];
    Promise.all(promises).then((r: any) => {
      this.setarFabricantes(r[0]);
      this.setarProdutos(r[1]);
      this.setarPropriedades(r[2]);
      this.setarProdutosOpcoes(r[3]);
      this.setarProdutoDetalhe(r[4]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
    });
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

  buscarFabricantes(): Promise<ProdutoCatalogoFabricante[]> {
    return this.produtoService.buscarFabricantes().toPromise();
  }

  buscarPropriedadesProdutoAtivo(): Promise<ProdutoCatalogoItemProdutosAtivosDados[]> {
    let obj: ProdutosAtivosRequestViewModel = new ProdutosAtivosRequestViewModel();
    obj.idProduto = this.id;
    return this.produtoService.buscarPropriedadesProdutoAtivo(obj).toPromise();
  }

  buscarPropriedades(): Promise<ProdutoCatalogoPropriedade[]> {
    return this.produtoService.buscarPropriedades().toPromise();
  }

  buscarProdutosOpcoes(): Promise<ProdutoCatalogoPropriedadeOpcao[]> {
    return this.produtoService.buscarOpcoes().toPromise();
  }

  buscarProdutoDetalhe(): Promise<ProdutoCatalogo> {
    return this.produtoService.buscarProdutoDetalhe(this.id).toPromise();
  }

  setarFabricantes(r: ProdutoCatalogoFabricante[]) {
    if (r != null) {
      this.fabricantes = r;
    }
  }

  setarProdutos(r: ProdutoCatalogoItemProdutosAtivosDados[]) {
    if (r != null) {
      this.consolidarLista(r);
    }
  }

  setarPropriedades(r: ProdutoCatalogoPropriedade[]) {
    if (r != null) {
      this.propriedades = r;
      this.montarListaProdutoParaTela();
    }
  }

  setarProdutosOpcoes(r: ProdutoCatalogoPropriedadeOpcao[]) {
    if (r != null) {
      this.opcoes = r;
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
  }

  setarProdutoDetalhe(r: ProdutoCatalogo) {
    if (r != null) {
      this.produtoDetalhe = r;
    }
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

  voltarClick(): void {
    if (this.validacaoFormularioService.validaForm(this.form)) {
    }
    this.router.navigate(["//produtos-catalogo/listar"]);
  }

  onChangeAtivo(idPropriedade: number, index: number) {
    this.produtosParaTela[index].propriedadeOcultaItem = !this.produtosParaTela[index].propriedadeOcultaItem;
  }

  excluirImagemClick(idImagem) {
    if (this.produtoDetalhe.imagem.Caminho == "sem-imagem.png") {
      this.imgSemImagem = this.produtoDetalhe.imagem;
      this.produtoDetalhe.imagem = null;
      return;
    }

    this.carregando = true;

    this.produtoService.excluirImagem(this.produtoDetalhe.Id, idImagem).toPromise().then((r) => {
      if (r != null) {
        this.carregando = false;
        this.alertaService.mostrarMensagem(r);
        return;
      }
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(()=>{
      this.carregando = false;
      this.produtoDetalhe.imagem = null;
      this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
    });
  }

  atualizarProdutoClick() {
    this.carregando = true;
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
    produto.Fabricante = this.produtoDetalhe.Fabricante;
    produto.campos = campos;
    if (!!this.imagem) {
      produto.imagem = new ProdutoCatalogoImagem();
      produto.imagem = this.imagem;
    }

    let formData = new FormData();
    if (!!this.arquivo)
      formData.append("arquivo", this.arquivo, this.arquivo.name);

    formData.append("produto", JSON.stringify(produto));
    formData.append("loja", this.lojaLogada);

    this.produtoService.atualizarProduto(formData).toPromise().then((r) => {
      if (r != null) {
        this.carregando = false;
        this.mensagemService.showErrorViaToast([r]);
        return;
      }
      this.carregando = false;
      this.mensagemService.showSuccessViaToast("Atualizado com sucesso!");
      this.router.navigate(["//produtos-catalogo/listar"]);
    }).catch((r) => {
      this.carregando = false;
      if (r.error.message == undefined) {
        this.alertaService.mostrarErroInternet(r);
        return;
      }
      this.sweetAlertService.aviso(r.error.message);
    });
  }

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

  onSelectFile(event) {
    let arquivo = event.files[0];
    this.arquivo = arquivo;
    this.setarDadosImagem(arquivo);
  }

  setarDadosImagem(arquivo: any): void {
    let img = new ProdutoCatalogoImagem();
    img.IdProdutoCatalogo = "-1";
    img.IdIipoImagem = 1;
    img.Caminho = arquivo.name;
    img.Ordem = "200";

    this.imagem = img;
  }
}

