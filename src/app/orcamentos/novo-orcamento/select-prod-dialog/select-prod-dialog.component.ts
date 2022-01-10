import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { SelecProdInfo } from './selec-prod-info';
import { ProdutoTela } from './produto-tela';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { ProdutoDto } from 'src/app/dto/produtos/ProdutoDto';
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
    private readonly novoOrcamentoService: NovoOrcamentoService,
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

  ngOnInit(): void {
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.transferirDados();

    this.prodsTela = this.prodsArray;
    this.novoOrcamentoService.pageItens = this.telaDesktop ? 3 : 6;
  }
  public combo: ProdutoComboDto = new ProdutoComboDto();
  transferirDados() {
    this.selecProdInfoPassado.produtoComboDto.produtosCompostos.forEach(p => {
      let produtoDto = new ProdutoDto();
      produtoDto.fabricante = p.paiFabricante;
      produtoDto.fabricanteNome = p.paiFabricanteNome;
      produtoDto.produto = p.paiProduto;
      produtoDto.precoLista = p.paiPrecoTotal;
      produtoDto.descricaoHtml = p.paiDescricao;
      this.prodsArray.push(new ProdutoTela(produtoDto, p));
    });

    this.selecProdInfoPassado.produtoComboDto.produtosSimples.forEach(p => {
      this.prodsArray.push(new ProdutoTela(p, null));
    })
  }



  digitado: string = "";
  digitouProd(e: Event) {
    this.digitado = ((e.target) as HTMLInputElement).value;
    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);

    this.prodsTela = this.prodsArray.filter(f => f.visivel == true);
  }

  addProduto() {
    if (this.selecionado) {
      let qtdeItens: number = 0;
      if (this.selecionado.Filhos.length > 0) {
        qtdeItens = this.selecionado.Filhos.length;
      }
      else {
        qtdeItens++;
      }
      if (this.novoOrcamentoService.qtdeProdutosOpcao + qtdeItens > this.novoOrcamentoService.limiteQtdeProdutoOpcao) {
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
}
