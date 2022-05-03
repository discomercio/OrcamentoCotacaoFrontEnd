import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { exit } from 'process';

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
  lstOpcoes: SelectItem[][] = [];
  lstFabricantes: SelectItem[] = [];
  urlUpload: string;

  // Campos de Propriedades dinâmicos da tela
  lstPropriedades: any = [];

  // Campos de Propriedades dinâmicos da tela (Ativo ou Não)
  lstPropriedadesAtivo: any = [];

  ngOnInit(): void {
    this.carregando = true;
    this.criarForm();
    this.buscarPropriedades();
    this.buscarOpcoes();
    this.buscarFabricantes();
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
          lstFabricantes.push({ label: r[indice]['Nome'], value: r[indice]['Fabricante'] })
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
  }
  onUpload($event, id): void {
  }
  ativoClick($event): void {
  }

  salvarClick() {      
        
    if (!this.validacaoFormularioService.validaForm(this.form)){      
      return;
    } 
    
    let prod = new ProdutoCatalogo();

    prod.Fabricante = this.form.controls.fabricante.value;
    prod.Produto = this.form.controls.produto.value;
    prod.Nome = this.form.controls.nome_produto.value;
    prod.Descricao = this.form.controls.descricao.value;
    prod.Ativo = "true";
    prod.campos = [];
    prod.imagens = [];

    this.produtoService.criarProduto(prod).toPromise().then((r) => {
      if (r != null) {}      
    }).catch((r)=> this.alertaService.mostrarErroInternet(r));       
    
    this.cadastrarItem();
    
  }

  cadastrarItem(){

    let produtoCatalogoItem =  new ProdutoCatalogoItem();

    var indice = 0;
    
    while (indice< this.lstPropriedades.length){
            
      produtoCatalogoItem.IdProdutoCatalogo = this.lstPropriedades[indice]['IdProdutoCatalogo'];
      produtoCatalogoItem.IdProdutoCatalogoPropriedade = this.lstPropriedades[indice]['IdProdutoCatalogoPropriedade'];
      produtoCatalogoItem.IdProdutoCatalogoPropriedadeOpcao = this.lstPropriedades[indice]['IdProdutoCatalogoPropriedadeOpcao'];
      produtoCatalogoItem.Valor = this.lstPropriedades[indice]['Valor'];        
      produtoCatalogoItem.Oculto = this.lstPropriedades[indice]['Oculto'];  

      this.produtoService.criarProdutoCatalogoItem(produtoCatalogoItem).toPromise().then((r) => {
        if (r != null) {
          this.mensagemService.showSuccessViaToast("Produto catálogo criado com sucesso!");
            this.router.navigate(["//produtos-catalogo/listar"]);
        }
      }).catch((r)=> this.alertaService.mostrarErroInternet(r));      
      indice++;
    }            
  }  

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

  onChangeAtivo(idProdutoCatalogoPropriedade, oculto) {
    
    this.lstPropriedadesAtivo.push(
      {
        IdProdutoCatalogoPropriedade: idProdutoCatalogoPropriedade,
        Oculto: oculto.checked
      });
  }

}


