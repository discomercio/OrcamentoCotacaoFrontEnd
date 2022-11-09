import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { SelecProdInfo } from './selec-prod-info';
import { ProdutoTela } from './produto-tela';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-select-prod-dialog',
  templateUrl: './select-prod-dialog.component.html',
  styleUrls: ['./select-prod-dialog.component.scss']
})
export class SelectProdDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public readonly mensagemService: MensagemService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService) {
    super(telaDesktopService)
  }

  @ViewChild('dataTable') table: Table;
  displayModal: boolean = false;
  selecProdInfoPassado: SelecProdInfo;
  public prodsTela: ProdutoTela[] = new Array();
  public prodsArray: ProdutoTela[] = new Array();
  public moedaUtils: MoedaUtils = new MoedaUtils();
  selecionado: ProdutoTela;
  codigo: string;
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;
  stringUtils = StringUtils;
  first: number = 0;

  ngOnInit(): void {
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.transferirDados();

    this.prodsTela = this.prodsArray;
    this.novoOrcamentoService.pageItens = this.telaDesktop ? 3 : 6;
  }
  public combo: ProdutoComboDto = new ProdutoComboDto();

  public limiteMaximo = 1000 * 1000;
  transferirDados() {

    const limite = this.limiteMaximo;
    for (let copiar = 0; copiar < limite; copiar++) {
      //acabou?
      if (!(this.prodsArray.length < this.selecProdInfoPassado.produtoComboDto.produtosSimples.length))
        break;
      //colocamos mais um
      let xy = new ProdutoTela(this.selecProdInfoPassado.produtoComboDto.produtosSimples[this.prodsArray.length],
        this.selecProdInfoPassado.produtoComboDto.produtosCompostos);

      this.prodsArray.push(xy);
    }
  }



  digitado: string = "";
  digitouProd(e: Event) {
    this.digitado = ((e.target) as HTMLInputElement).value;
    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);

    this.prodsTela = this.prodsArray.filter(f => f.visivel == true);
    this.setarPaginacao();
  }

  setarPaginacao() {
    this.first = 0;
  }

  addProduto() {
    // precisa guardar os codigos de produto para fazer um distinct,
    // vamos guardar os produtos já separadamente?? se sim, criar no "novoOrcamentoService" pois assim,
    // saberemos se estamos ultrapassando o limite
    if (this.selecionado) {
      let qtdeItens: number = 0;
      if (this.selecionado.Filhos.length > 0) {
        this.selecionado.Filhos.forEach(x => {
          let produto = this.novoOrcamentoService.controleProduto.filter(c => c == x.produto)[0];
          if (!produto) {
            this.novoOrcamentoService.controleProduto.push(x.produto);
            qtdeItens++; 
          }
        });
      }
      else {
        let produto = this.novoOrcamentoService.controleProduto.filter(c => c == this.selecionado.produtoDto.produto)[0];
          if (!produto) {
            this.novoOrcamentoService.controleProduto.push(this.selecionado.produtoDto.produto);
            qtdeItens++; 
          }
      }
      if (this.novoOrcamentoService.controleProduto.length > this.novoOrcamentoService.limiteQtdeProdutoOpcao) {
        this.novoOrcamentoService.controleProduto.splice(this.novoOrcamentoService.controleProduto.length - qtdeItens, qtdeItens);
        this.mensagemService.showWarnViaToast("A quantidade de itens excede a quantidade máxima de itens permitida por opção!");
        return;
      }
      this.ref.close(this.selecionado);
      return;
    }
    let msg: string[] = new Array();
    msg.push("Por favor, selecione um produto!");
    this.mensagemService.showErrorViaToast(msg);
  }

  marcarLinha(e: Event) {
    e.stopImmediatePropagation();
  }

  produtoDescr(fabricante: string, produto: string) {
    let p = this.selecProdInfoPassado.produtoComboDto.produtosSimples.filter(el => el.fabricante == fabricante && el.produto == produto)[0];
    return p;
  }
}
