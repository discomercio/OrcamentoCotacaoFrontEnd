import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, PageEvent, MatInput } from '@angular/material';
import { SelecProdInfo } from './selec-prod-info';
import { ProdutoTela } from './produto-tela';
import { supportsPassiveEventListeners } from '@angular/cdk/platform';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { $ } from 'protractor';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Component({
  selector: 'app-selec-prod-dialog',
  templateUrl: './selec-prod-dialog.component.html',
  styleUrls: ['./selec-prod-dialog.component.scss']
})
export class SelecProdDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(
    public readonly dialogRef: MatDialogRef<SelecProdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selecProdInfoPassado: SelecProdInfo,
    telaDesktopService: TelaDesktopService,
    public readonly alertaService: AlertaService) {

    super(telaDesktopService);

    //no desktop deixamos um limite inicial maior
    this.limiteInicial = 20;
    if (this.telaDesktop) {
      this.limiteInicial = 80;
    }
    this.limiteTela = this.limiteInicial;

  }


  ngOnInit() {
    this.produto = ProdutoTela.FabrProd(this.selecProdInfoPassado.Fabricante, this.selecProdInfoPassado.Fabricante_Nome,
      this.selecProdInfoPassado.Produto);
    this.qtde = this.selecProdInfoPassado.Qte;
    if (this.selecProdInfoPassado.Produto) {
      this.digitado = this.selecProdInfoPassado.Produto;
    }
    this.qtde = 1;
    this.transferirDadosArray();

  }



  //#region carga
  public prodsArray: ProdutoTela[] = new Array();
  //dados vazios, para mostrar enquanto constroi a lista
  public prodsTela: ProdutoTela[] = new Array();

  /*
  a tela com 600 produtos ficava muito lenta
  então temos o seguinte fucnionamento: ao carregar, mostra os primerios X registros
  depois, se clicar no botão para mostrar tudo, aí carrega todos, e demora o que demorar...
  */

  //maximo que mostramos na tela
  public limiteMaximo = 1000 * 1000; //1 mega registros...
  //quantos mostramos na tela inicialmente
  public limiteInicial = 50;
  public limiteTela = this.limiteInicial;

  //se estamos carregando a lista completa de produtos
  //mas ainda não terminou de mostrar
  //aí o botão muda, ao inves de ser Mostrar todo, fica Carregando
  public limiteMudando = false;

  public limiteZerar() {
    //mostramos sem limites
    this.limiteTela = this.limiteMaximo;
    this.limiteMudando = true;
    setTimeout(() => {
      this.atualizarProdsTela();
      this.limiteMudando = false;
    }, 0);
  }

  private transferirDadosArray() {
    //sem limite!
    const limite = this.limiteMaximo;
    for (let copiar = 0; copiar < limite; copiar++) {
      //acabou?
      if (!(this.prodsArray.length < this.selecProdInfoPassado.produtoComboDto.ProdutoDto.length))
        break;
      //colocamos mais um
      this.prodsArray.push(new ProdutoTela(this.selecProdInfoPassado.produtoComboDto.ProdutoDto[this.prodsArray.length],
        this.selecProdInfoPassado.produtoComboDto.ProdutoCompostoDto));
    }

    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);
    this.atualizarProdsTela();
  }

  public msgProdNaoEncontrado: string = "";
  public atualizarProdsTela() {
    this.msgProdNaoEncontrado = "";
    this.prodsTela = this.prodsArray.filter(el => el.visivel).slice(0, this.limiteTela);

    //marcar o unico produto selecionado
    var selecionado = this.prodsArray.filter(el => el.visivel);
    this.produto = "";
    if (selecionado.length > 0) {
      this.produto = this.ProdutoTelaFabrProd(selecionado[0].produtoDto.Fabricante, selecionado[0].produtoDto.Fabricante_Nome,
        selecionado[0].produtoDto.Produto);
    }

    if (this.prodsTela.length <= 0)
      this.msgProdNaoEncontrado = "Produto não encontrado!";
  }




  //precisamos disto para acertar o foco
  //somente o autofocus do html não funciona quando carrega a ciaxa de diálogo pela segunda vez
  // @ViewChild("digitadocx", { static: true }) digitadoCx: ElementRef;
  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     //TEM QUE SER por timeout para evitar o erro
  //     //ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'mat-form-field-should-float: false'. Current value: 'mat-form-field-should-float: true'.
  //     this.digitadoCx.nativeElement.focus();
  //   }, 100);
  // }
  verificaNegativo() {
    if (!Number.isInteger(this.qtde))
      this.qtde = 1;
    if (this.qtde < 0)
      this.qtde = 1;

  }

  mais() {
    var atual = this.qtde;
    var novo = atual - (-1); //Evitando Concatenacoes
    this.qtde = novo;
  }

  public menos() {
    var atual = this.qtde;
    if (atual > 0) { //evita números negativos
      var novo = atual - 1;
      this.qtde = novo;
    }    
    // if (this.qtde >= 0)
    //   this.qtde = 1;

    
  }

  public keydownProduto(event: KeyboardEvent): void {

    if (event.which == 13) {
      event.cancelBubble = true;
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.onAdicionarClick();
    }

  }

  //alteraram o produto
  public digitado = "";
  digitouProd(e: Event) {
    this.digitado = ((e.target) as HTMLInputElement).value;
    
    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);
    this.atualizarProdsTela();
  }

  onNoClick(event: MouseEvent): void {

    this.selecProdInfoPassado.ClicouOk = false;
    this.dialogRef.close(false);

  }

  onAdicionarClick(): void {
    //afazer: colocar um limitador para 12 itens no máximo


    if (!this.produto || this.produto === "") {
      this.alertaService.mostrarMensagem("Por favor, selecione um produto.");
      return;
    }
    if (!this.qtde || this.qtde <= 0) {
      this.alertaService.mostrarMensagem("Por favor, selecione uma quantidade.");
      return;
    }

    //separado por /
    //depende do ProdutoTela.FabrProd
    //alteramos "selecProdInfoPassado" incluimos mais um campo de descrição do fabricante
    //para que possa ser realizada a busca pelo nome do fabricante
    //001/ELECTROLUX/001003
    this.selecProdInfoPassado.Fabricante = this.produto.split("/")[0];
    this.selecProdInfoPassado.Produto = this.produto.split("/")[2];//o item 2 é o cód do produto

    this.selecProdInfoPassado.Qte = this.qtde;
    this.selecProdInfoPassado.ClicouOk = true;

    this.dialogRef.close(true);
  }

  public produtoDescr(fabricante: string, produto: string) {
    return this.selecProdInfoPassado.produtoComboDto.ProdutoDto.filter(el => el.Fabricante == fabricante && el.Produto == produto)[0];
  }

  public moedaUtils = new MoedaUtils();

  //a quantidade
  public qtde: number;
  //o produto
  public produto: string;
  //para formatar o produto e o fabricante
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;

}
