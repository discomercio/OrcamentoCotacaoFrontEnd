import { Subject } from 'rxjs';
import { ProdutoCatalogoOpcao } from './../../../dto/produtos-catalogo/ProdutoCatalogoOpcao';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProdutoCatalogo } from '../../../dto/produtos-catalogo/ProdutoCatalogo';
import { ProdutoCatalogoPropriedade } from '../../../dto/produtos-catalogo/ProdutoCatalogoPropriedade';
import { ProdutoCatalogoFabricante } from '../../../dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoPropriedadeOpcao } from '../../../dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { SelectItem } from 'primeng/api';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ProdutoCatalogoItem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoItem';
import { ProdutoCatalogoImagem } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoImagem';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-criar-produto',
  templateUrl:
    './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoCriarComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly autenticacaoService: AutenticacaoService) { }

  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public produto: ProdutoCatalogo = new ProdutoCatalogo();
  public uploadedFiles: any[] = [];

  carregando: boolean = false;
  propriedades: ProdutoCatalogoPropriedade[];
  fabricantes: ProdutoCatalogoFabricante[];
  opcoes: ProdutoCatalogoPropriedadeOpcao[];
  urlUpload: string;
  imgUrl: string;
  lstOpcoes: SelectItem[][] = [];
  lstFabricantes: SelectItem[] = [];
  lstPropriedades: ProdutoCatalogoOpcao[] = [];
  lstPropriedadesAtivo: any = [];

  ngOnInit(): void {

    if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.CatalogoCaradastrarIncluirEditar)) {
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(["/dashboards"]);
      return;
    }

    this.carregando = true;
    this.criarForm();
    this.buscarPropriedades();
    this.buscarOpcoes();
    this.buscarFabricantes();
    this.produto.Ativo = true
    this.urlUpload = this.produtoService.urlUpload;
    this.imgUrl = this.produtoService.imgUrl;
  }

  criarForm() {
    this.form = this.fb.group({
      descricao: ['', [Validators.required]],
      nome_produto: ['', [Validators.required]],
      produto: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      fabricante: ['', [Validators.required]],
      ativo: [''],
    });
  }

  voltarClick(): void {
    this.router.navigate(["//produtos-catalogo/listar"]);
  }

  buscarPropriedades() {
    this.produtoService.buscarPropriedades().toPromise().then((r) => {
      if (r != null) {
        this.propriedades = r;

        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
              if(!o.oculto){
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

  excluirImagemClick(idImagem) {
    this.produto.imagem = null;

    this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
  }

  obterIdOpcao(idProdutoCatalogoPropriedade, valorOpcaoSelecionado) {
    var opcao = this.opcoes.filter(x => x.id_produto_catalogo_propriedade == idProdutoCatalogoPropriedade && x.valor == valorOpcaoSelecionado)[0];

    if (opcao) {
      return opcao.id;
    }

    return null;
    
  }

  salvarClick() {
    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }

    this.produtoService.buscarPorCodigo(this.form.controls.produto.value).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showWarnViaToast(`Código [${this.form.controls.produto.value}] já foi cadastrado!`);
        return;
      } else {
        let prod = new ProdutoCatalogo();
        let campo = new ProdutoCatalogoItem();

        prod.Fabricante = this.form.controls.fabricante.value;
        prod.Produto = this.form.controls.produto.value;
        prod.Nome = this.form.controls.nome_produto.value;
        prod.Descricao = this.form.controls.descricao.value;
        prod.Ativo = this.produto.Ativo;
        prod.campos = [];

        if (!!this.imagem) {
          prod.imagem = new ProdutoCatalogoImagem();
          prod.imagem = this.imagem;
        }
        var listaInput = document.getElementsByTagName("input");

        for (let i = 0; i < listaInput.length; i++) {
          if (listaInput[i].id.startsWith('txt') && listaInput[i].value != "") {
            campo = new ProdutoCatalogoItem();
            campo.IdProdutoCatalogo = '-1';
            campo.IdProdutoCatalogoPropriedade = listaInput[i].id.replace('txt-', '');
            campo.IdProdutoCatalogoPropriedadeOpcao = '-1';
            campo.Valor = listaInput[i].value;
            campo.Oculto = document.getElementById(listaInput[i].id.replace('txt', 'chk')).getElementsByTagName('input')[0].checked.toString() == "true" ? false : true;
            prod.campos.push(campo);
          }
        }

        var listaDrop = document.getElementsByTagName("p-dropdown");
        for (let d = 0; d < listaDrop.length - 1; d++) {
          var listaOpt = listaDrop[d].getElementsByTagName("span");
          for (let i = 0; i < listaOpt.length - 1; i++) {
            if (listaDrop[d].id.startsWith('cbo') && listaOpt[i].innerText != "Selecione") {
              campo = new ProdutoCatalogoItem();
              campo.IdProdutoCatalogo = '-1';
              campo.IdProdutoCatalogoPropriedade = listaDrop[d].id.replace('cbo-', '');
              campo.IdProdutoCatalogoPropriedadeOpcao = `${this.obterIdOpcao(listaDrop[d].id.replace('cbo-', ''), listaOpt[i].innerText)}`;
              campo.Valor = '';
              campo.Oculto = document.getElementById(listaDrop[d].id.replace('cbo', 'chk')).getElementsByTagName('input')[0].checked.toString() == "true" ? false : true;
              prod.campos.push(campo);
            }
          }
        }

        if (!this.validacaoFormularioService.validaForm(this.form)) {
          return;
        }

        let formData = new FormData();
        if (!!this.arquivo)
          formData.append("arquivo", this.arquivo, this.arquivo.name);

        formData.append("produto", JSON.stringify(prod));
        this.produtoService.criarProduto(formData).toPromise().then((r) => {
          if (r != null) {
            this.mensagemService.showSuccessViaToast("Produto criado com sucesso!");
            this.router.navigate(["//produtos-catalogo/listar"]);
          }
        }).catch((r) => this.alertaService.mostrarErroInternet(r));


      }
    }).catch();

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


