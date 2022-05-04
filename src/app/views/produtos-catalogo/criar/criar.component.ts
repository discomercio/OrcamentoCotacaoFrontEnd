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

@Component({
  selector: 'app-criar-produto',
  templateUrl: './criar.component.html',
  styleUrls: ['./criar.component.scss']
})
export class ProdutosCatalogoCriarComponent implements OnInit {

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
    this.carregando = true;
    this.criarForm();
    this.buscarPropriedades();
    this.buscarOpcoes();
    this.buscarFabricantes();
    this.produto.Ativo = 'true';
    this.urlUpload = this.produtoService.urlUpload;
    this.imgUrl = this.produtoService.imgUrl;
  }

  criarForm() {
    this.form = this.fb.group({
      descricao: ['', [Validators.required]],
      nome_produto: ['', [Validators.required]],
      produto: ['', [Validators.required]],
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

  onBeforeUpload($event): void {
    //  $event.formData.append('idProdutoCalatogo', this.id);
  }

  onUpload($event, id): void {
      var arquivo = $event.originalEvent.body.file;

     this.produto.imagens = [];
     let img = new ProdutoCatalogoImagem();
     img.IdProdutoCatalogo = "-1";
     img.IdIipoImagem = "1";
     img.Caminho = arquivo.split('\\')[arquivo.split('\\').length - 1];
     img.Ordem = "200";

     this.produto.imagens.push(img);

     this.mensagemService.showSuccessViaToast("Upload efetuado com sucesso.");
    }

  excluirImagemClick(idImagem) {
    this.produto.imagens = null;

    this.mensagemService.showSuccessViaToast("Imagem excluída com sucesso!");
  }

  obterIdOpcao(idProdutoCatalogoPropriedade, valorOpcaoSelecionado) {
    var opcao = this.opcoes.filter(x => x.id_produto_catalogo_propriedade == idProdutoCatalogoPropriedade && x.valor == valorOpcaoSelecionado)[0];

    if(opcao) {
        return opcao.id;
    }

    return null;
  }

  salvarClick() {
    this.produtoService.buscarPorCodigo(this.form.controls.produto.value).toPromise().then((r) => {
        if(r != null) {
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
            prod.imagens = this.produto.imagens == null ? []  : this.produto.imagens;

            var listaInput = document.getElementsByTagName("input");
            for(let i = 0; i < listaInput.length -1; i++) {
                if(listaInput[i].id.startsWith('txt') && listaInput[i].value != "") {
                    campo = new ProdutoCatalogoItem();
                    campo.IdProdutoCatalogo = '-1';
                    campo.IdProdutoCatalogoPropriedade = listaInput[i].id.replace('txt-','');
                    campo.IdProdutoCatalogoPropriedadeOpcao = '-1';
                    campo.Valor = listaInput[i].value;
                    campo.Oculto = document.getElementById(listaInput[i].id.replace('txt','chk')).getElementsByTagName('input')[0].checked.toString();
                    prod.campos.push(campo);

                    // console.log(`INPUT    > id: ${listaInput[i].id} - valor: ${listaInput[i].value} - placeholder: ${listaInput[i].placeholder}`);
                    // console.log(`CHECKBOX > id: ${listaInput[i].id.replace('txt','chk')} - valor: ${document.getElementById(listaInput[i].id.replace('txt','chk')).getElementsByTagName('input')[0].checked}`);
                    // console.log('');
                }
            }

            var listaDrop = document.getElementsByTagName("p-dropdown");
            for(let d = 0; d < listaDrop.length -1; d++) {
                var listaOpt = listaDrop[d].getElementsByTagName("span");
                for(let i = 0; i < listaOpt.length -1; i++) {
                    if(listaDrop[d].id.startsWith('cbo') && listaOpt[i].innerText != "Selecione") {
                        campo = new ProdutoCatalogoItem();
                        campo.IdProdutoCatalogo = '-1';
                        campo.IdProdutoCatalogoPropriedade = listaDrop[d].id.replace('cbo-','');
                        campo.IdProdutoCatalogoPropriedadeOpcao = `${this.obterIdOpcao(listaDrop[d].id.replace('cbo-',''), listaOpt[i].innerText)}`;
                        campo.Valor = '';
                        campo.Oculto = document.getElementById(listaDrop[d].id.replace('cbo','chk')).getElementsByTagName('input')[0].checked.toString();
                        prod.campos.push(campo);

                        // console.log(`DROPDOWN > id: ${listaDrop[d].id} - valor: ${this.obterIdOpcao(listaDrop[d].id.replace('cbo-',''), listaOpt[i].innerText)} - ${listaOpt[i].innerText}`);
                        // console.log(`CHECKBOX > id: ${listaDrop[d].id.replace('cbo','chk')} - valor: ${document.getElementById(listaDrop[d].id.replace('cbo','chk')).getElementsByTagName('input')[0].checked}`);
                        // console.log('');
                    }
                }
            }

            // console.log('****************************************');
            // console.log(prod);

            if (!this.validacaoFormularioService.validaForm(this.form)){
              return;
            }

            this.produtoService.criarProduto(prod).toPromise().then((r) => {
              if (r != null) {}
            }).catch((r)=> this.alertaService.mostrarErroInternet(r));

            this.router.navigate(["//produtos-catalogo/listar"]);
        }
      }).catch();

  }


}


