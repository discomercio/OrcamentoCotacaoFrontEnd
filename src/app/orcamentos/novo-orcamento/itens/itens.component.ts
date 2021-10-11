import { Component, OnInit, ViewChild, HostListener, DebugElement } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { SelecProdInfo } from '../select-prod-dialog/selec-prod-info';
import { SelectProdDialogComponent } from '../select-prod-dialog/select-prod-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { ProdutoTela } from '../select-prod-dialog/produto-tela';
import { retryWhen } from 'rxjs/operators';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  styleUrls: ['./itens.component.scss']
})
export class ItensComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private produtoService: ProdutoService,
    public dialogService: DialogService,
    public alert: AlertaService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  stringUtils = StringUtils;
  moedaUtils: MoedaUtils = new MoedaUtils();
  lstProdutos: ProdutoOrcamentoDto[] = new Array();

  ngOnInit(): void {
    if (this.novoOrcamentoService.orcamentoCotacaoDto == undefined) this.novoOrcamentoService.criarNovo();
    console.log(this.novoOrcamentoService.orcamentoCotacaoDto);
    this.inscreveProdutoComboDto();
  }

  produtoComboDto: ProdutoComboDto;
  inscreveProdutoComboDto(): void {
    this.produtoService.buscarProdutosCompostosXSimples().toPromise().then((r) => {
      if (r != null) {
        this.produtoComboDto = r;
      }
    })
  }

  adicionarProduto(): void {
    this.mostrarProdutos(null);
  }

  selecProdInfo = new SelecProdInfo();
  mostrarProdutos(linha: ProdutoOrcamentoDto): void {
    this.selecProdInfo.produtoComboDto = this.produtoComboDto;
    this.selecProdInfo.ClicouOk = false;
    const ref = this.dialogService.open(SelectProdDialogComponent,
      {
        width: "65vw",
        styleClass: 'dynamicDialog',
        data: this.selecProdInfo
      });

    ref.onClose.subscribe((resultado: ProdutoTela) => {
      if (resultado) {
        let filtro = this.lstProdutos.filter(f => f.Produto == resultado.produtoDto.Produto);
        if (filtro.length > 0) {
          filtro[0].Qtde++;
          this.digitouQte(filtro[0]);
          return;
        }

        this.inserirProduto(resultado);
      }
    });
  }

  inserirProduto(produto: ProdutoTela): void {
    let prod: ProdutoOrcamentoDto = new ProdutoOrcamentoDto();
    prod.Fabricante = produto.produtoDto.Fabricante;
    prod.Produto = produto.produtoDto.Produto;
    prod.Fabricante_Nome = produto.produtoDto.Fabricante_Nome;
    prod.Descricao = produto.produtoDto.Descricao_html;
    prod.Qtde = 1;
    prod.Preco_NF = produto.produtoDto.Preco_lista;
    prod.CustoFinancFornecPrecoListaBase = produto.produtoDto.Preco_lista;
    prod.Desc_Dado = 0;
    prod.Preco_Venda = produto.produtoDto.Preco_lista;
    prod.TotalItem = produto.produtoDto.Preco_lista;
    prod.TotalItemRA = produto.produtoDto.Preco_lista;
    prod.AlterouValorRa = false;
    prod.Alterou_Preco_Venda = false;

    this.lstProdutos.push(prod);
    this.novoOrcamentoService.orcamentoCotacaoDto.ListaProdutos = this.lstProdutos;
  }

  digitouQte(item: ProdutoOrcamentoDto): void {
    if (item.Qtde <= 0) item.Qtde = 1;

    item.TotalItem = item.Preco_Venda * item.Qtde;

    // if(PermiteRAStatus)
    item.TotalItemRA = item.Preco_NF * item.Qtde;
  }

  digitouPreco_NF(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = Number.parseFloat((v / 100).toFixed(2) + '');

    if (Number.parseFloat(item.CustoFinancFornecPrecoListaBase.toFixed(2)) === v) item.AlterouValorRa = false;
    else item.AlterouValorRa = true;

    item.Preco_NF = this.moedaUtils.formatarDecimal(v);
    item.TotalItemRA = item.Preco_NF * item.Qtde;

    this.somarRA();
  }

  formatarPreco_NF(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    if (valor != "") {
      let v: any = valor.replace(/\D/g, '');
      v = Number.parseFloat((v / 100).toFixed(2) + '');
      item.Preco_NF = this.moedaUtils.formatarDecimal(v);
    }
  }

  formatarDesc(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    if (!isNaN(v)) {
      v = (v / 100).toFixed(2) + '';
      item.Desc_Dado = v;
    }
  }

  digitouDesc(e: Event, item: ProdutoOrcamentoDto): void {

    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    v = (v / 100).toFixed(2) + '';

    //se o desconto for digitado estamos alterando o valor de venda e não devemos mais alterar esse valor
    if (item.Desc_Dado == 0 || item.Desc_Dado.toString() == '') {
      item.Alterou_Preco_Venda = false;
    } else {
      item.Alterou_Preco_Venda = true;
    }

    this.digitouDescValor(item, v);
  }

  digitouDescValor(item: ProdutoOrcamentoDto, v: string): void {
    if (item.Desc_Dado === Number.parseFloat(v)) {
      if (item.Desc_Dado == 0) {
        item.Desc_Dado = 0;
      }
      return;
    }

    item.Desc_Dado = Number.parseFloat(v);

    if (item.Desc_Dado > 100) {
      item.Desc_Dado = 100;
    }

    if (item.Desc_Dado) {
      item.Preco_Venda = item.CustoFinancFornecPrecoListaBase * (1 - item.Desc_Dado / 100);
      item.Preco_Venda = Number.parseFloat(item.Preco_Venda.toFixed(2));
    }
    else {
      item.Preco_Venda = item.CustoFinancFornecPrecoListaBase;
    }
    this.digitouQte(item);
  }

  formataPreco_Venda(e: Event, item: ProdutoOrcamentoDto):void{
    let valor = ((e.target) as HTMLInputElement).value;
    if (valor != "") {
      let v: any = valor.replace(/\D/g, '');
      v = Number.parseFloat((v / 100).toFixed(2) + '');
      item.Preco_Venda = this.moedaUtils.formatarDecimal(v);
    }
  }
  digitouPreco_Venda(e: Event, item: ProdutoOrcamentoDto) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    
    item.TotalItem = item.Qtde * item.CustoFinancFornecPrecoListaBase;
    item.VlTotalItem = item.Qtde * item.CustoFinancFornecPrecoListaBase;

    item.Desc_Dado = 100 * (item.CustoFinancFornecPrecoListaBase - v) / item.CustoFinancFornecPrecoListaBase;
    //calcula o desconto
    item.Desc_Dado = this.moedaUtils.formatarDecimal(item.Desc_Dado);

    if (item.CustoFinancFornecPrecoListaBase == item.Preco_Venda) {
      item.Alterou_Preco_Venda = false;
    } else {
      item.Alterou_Preco_Venda = true;
    }

    this.digitouQte(item);
  }

  somaRA: string;
  somarRA(): string {
    let total = this.novoOrcamentoService.totalPedido();
    let totalRa = this.novoOrcamentoService.totalPedidoRA();
    // vou formatar  aqui antes de passar para a tela
    let valor_ra = this.moedaUtils.formatarDecimal(totalRa - total);
    if (valor_ra > 0)
      this.somaRA = this.moedaUtils.formatarMoedaSemPrefixo(valor_ra);
    else
      this.somaRA = this.moedaUtils.formatarValorDuasCasaReturnZero(valor_ra);

    return this.somaRA;
  }

  confirmaProdutoComposto(item: ProdutoOrcamentoDto): boolean {
    let pc = this.produtoComboDto.ProdutoCompostoDto.filter(f => f.PaiProduto == item.Produto)[0];
    if (pc) {
      return true;
    }

    return false;
  }

  mensagemAlerta: string = "";
  produtoTemAviso(item: ProdutoOrcamentoDto): boolean {
    let retorno: boolean = false;
    if (item) {
      if (this.confirmaProdutoComposto(item)) {
        let produto = this.produtoComboDto.ProdutoCompostoDto.filter(f => f.PaiProduto == item.Produto)[0];
        produto.Filhos.forEach(i => {
          if (i.Alertas) {
            retorno = true;
            this.mensagemAlerta = i.Alertas;
          }
        });
      }
      if (!this.confirmaProdutoComposto(item)) {
        let produto = this.produtoComboDto.ProdutoDto.filter(f => f.Produto == item.Produto)[0];
        if (produto.Alertas) {
          retorno = true;
          this.mensagemAlerta = produto.Alertas;
        }
      }
    }

    return retorno;
  }

  estoqueExcedido(item: ProdutoOrcamentoDto): boolean {
    if (!item) {
      return false;
    }

    if (this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.ProdutoCompostoDto.filter(f => f.PaiProduto == item.Produto)[0];
      let excede: boolean = false;
      produto.Filhos.forEach(i => {
        if (i.Estoque < item.Qtde) {
          excede = true;
          return;
        }
      });
      return excede;
    }
    if (!this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.ProdutoDto.filter(f => f.Produto == item.Produto)[0];
      if (produto.Estoque < item.Qtde) {
        return true;
      }
    }
    return false;
  }

  qtdeVendaPermitida(item: ProdutoOrcamentoDto): boolean {
    if (!item) {
      return false;
    }

    if (this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.ProdutoCompostoDto.filter(f => f.PaiProduto == item.Produto)[0];
      let excede: boolean = false;
      produto.Filhos.forEach(i => {
        if (i.Qtde_Max_Venda < item.Qtde) {
          excede = true;
          return;
        }
      });
      return excede;
    }
    if (!this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.ProdutoDto.filter(f => f.Produto == item.Produto)[0];
      if (produto.Qtde_Max_Venda < item.Qtde) {
        return true;
      }
    }
    return false;

  }

  incluirProduto() {

  }

  produtoSelecionado: ProdutoOrcamentoDto;
  removerItem(index:number) {
    debugger;
    this.lstProdutos.splice(index, 1);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
