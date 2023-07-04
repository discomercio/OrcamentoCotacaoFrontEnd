import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { ProdutoTela } from '../select-prod-dialog/produto-tela';
import { SelecProdInfo } from '../select-prod-dialog/selec-prod-info';

@Component({
  selector: 'app-select-clone-opcoes-dialog',
  templateUrl: './select-clone-opcoes-dialog.component.html',
  styleUrls: ['./select-clone-opcoes-dialog.component.scss']
})
export class SelectCloneOpcoesDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private readonly alertaService: AlertaService,
    telaDesktopService: TelaDesktopService) {
    super(telaDesktopService)
  }

  @ViewChild('dataTable') table: Table;
  public moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  selecProdInfoPassado: SelecProdInfo;
  displayModal: boolean = false;
  prodsTela: ProdutoTela[] = new Array();
  prodsArray: ProdutoTela[] = new Array();
  // carregandoProdutos:boolean = true;
  carregando:boolean;
  ngOnInit(): void {
    
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.transferirDados();

    this.prodsTela = this.prodsArray;
  }

  copiarOpcao(opcaoClone: OrcamentosOpcaoResponse) {
    // if(this.carregandoProdutos) return;

    let listaProdutosOpcao = opcaoClone.listaProdutos.slice();
    //O que queremos da opção
    // lista de produtos => precisamos para buscar os produtos 
    // forma de pagamento
    let retorno = { produtos: [], formasPagtos: [] };

    retorno.produtos = this.copiarProdutos(listaProdutosOpcao);
    retorno.formasPagtos = opcaoClone.formaPagto;
    this.ref.close(retorno);
  }

  copiarProdutos(produtos: ProdutoOrcamentoDto[]): ProdutoTela[] {
    let retorno = new Array<ProdutoTela>();
    //vamos verificar se o produto ainda existe para venda
    let item = new Array<ProdutoTela>();
    let itensInexistententes = new Array<string>();
    produtos.forEach(produto => {
      item = this.prodsArray.filter(x => x.produtoDto.produto == produto.produto);

      if (item.length == 0) {
        //vamos adicionar na lista para mostrar que esse produto não está mais a venda
        itensInexistententes.push(produto.fabricante + "/" + produto.produto);

        return;
      }
      item[0].qtde = produto.qtde;
      retorno.push(item[0]);
    });
    if (itensInexistententes.length > 0) {
      let texto = "Os produtos abaixo não estão mais a venda!\n"+ itensInexistententes.join('\n');
      this.alertaService.mostrarMensagem(texto);
    }
    //retornar o item
    return retorno;
  }

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

    // this.carregandoProdutos = false;

  }
}
