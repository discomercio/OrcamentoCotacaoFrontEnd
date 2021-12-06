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

@Component({
  selector: 'app-select-prod-dialog',
  templateUrl: './select-prod-dialog.component.html',
  styleUrls: ['./select-prod-dialog.component.scss']
})
export class SelectProdDialogComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public readonly mensagemService: MensagemService,
    private readonly novoOrcamentoService: NovoOrcamentoService) { }

  @ViewChild('dataTable') table: Table;
  displayModal: boolean = false;
  selecProdInfoPassado: SelecProdInfo;
  public prodsTela: ProdutoTela[] = new Array();
  public prodsArray: ProdutoTela[] = new Array();
  public moedaUtils: MoedaUtils = new MoedaUtils();
  selecionado: ProdutoTela;
  codigo: string;
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;
  

  ngOnInit(): void {
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.transferirDados();

    this.prodsTela = this.prodsArray;
  }
  public combo: ProdutoComboDto = new ProdutoComboDto();
  transferirDados() {
    this.selecProdInfoPassado.produtoComboDto.ProdutoCompostoDto.forEach(p => {
      let produtoDto = new ProdutoDto();
      produtoDto.Fabricante = p.PaiFabricante;
      produtoDto.Fabricante_Nome = p.PaiFabricanteNome;
      produtoDto.Produto = p.PaiProduto;
      produtoDto.Preco_lista = p.Preco_total_Itens;
      produtoDto.Descricao_html = p.PaiDescricao;
      this.prodsArray.push(new ProdutoTela(produtoDto, p));
    });

    this.selecProdInfoPassado.produtoComboDto.ProdutoDto.forEach(p => {
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

    this.mensagemService.showErrorViaToast("Por favor, selecione um produto!");
  }

  marcarLinha(e: Event) {
    e.stopImmediatePropagation();
  }
}
