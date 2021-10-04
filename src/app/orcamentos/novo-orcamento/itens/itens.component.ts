import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  styleUrls: ['./itens.component.scss']
})
export class ItensComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public readonly novoOrcamentoService: NovoOrcamentoService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  stringUtils = StringUtils;
  moedaUtils: MoedaUtils = new MoedaUtils();

  ngOnInit(): void {
    console.log(this.novoOrcamentoService.orcamentoCotacaoDto);
    this.criarForm();
  }

  lista() {
    let prod: ProdutoOrcamentoDto = new ProdutoOrcamentoDto();
    prod.Fabricante = "001";
    prod.Produto = this.produtos.length > 0 ? this.produtos.length > 1 ? "001092" : "001091" : "001090";
    prod.Fabricante_Nome = "ELECTROLUX";
    prod.Descricao = "Ar Cond. Electrolux EcoTurbo <b>V09F<\/b> 09 Frio";
    prod.Qtde = 1;
    prod.Preco_NF = 1000.30;
    prod.CustoFinancFornecPrecoListaBase = 1000.30;
    prod.Desc_Dado = 0;
    prod.Preco_Venda = 1000.30;
    prod.TotalItem = 1000.30;
    prod.AlterouValorRa = false;
    prod.Alterou_Preco_Venda = false;

    this.produtos.push(this.criarProdutosFormGroup(prod));
    this.form.patchValue(prod);
  }

  get produtos() {
    return this.form.controls["produtos"] as FormArray;
  }

  criarProdutosFormGroup(produto: ProdutoOrcamentoDto): FormGroup {
    return this.fb.group({
      Fabricante: [produto.Fabricante],
      Produto: [produto.Produto],
      Fabricante_Nome: [produto.Fabricante_Nome],
      Descricao: [produto.Descricao],
      Qtde: [produto.Qtde],
      Preco_NF: [this.moedaUtils.formatarMoedaSemPrefixo(produto.Preco_NF)],
      CustoFinancFornecPrecoListaBase: [produto.CustoFinancFornecPrecoListaBase],
      Desc_Dado: [produto.Desc_Dado],
      Preco_Venda: [produto.Preco_Venda],
      TotalItem: [produto.TotalItem],
      AlterouValorRa: [produto.AlterouValorRa],
      Alterou_Preco_Venda: [produto.Alterou_Preco_Venda]
    })
  }

  criarForm() {
    this.form = this.fb.group({
      produtos: this.fb.array([]),
    });
  }

  digitouQte(item: ProdutoOrcamentoDto) {
    if (item.Qtde <= 0) item.Qtde = 1;

    item.TotalItem = item.CustoFinancFornecPrecoListaBase * item.Qtde;
  }

  digitouPreco_NF(item:ProdutoOrcamentoDto){
  }

  formatarPreco_NF(item:ProdutoOrcamentoDto){
    debugger;
    let v: any = item.Preco_NF.toString().replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    item.Preco_NF = v;
  }
  incluirProduto() {

  }

  produtoSelecionado: ProdutoOrcamentoDto;
  removerItem(index:number) {
    debugger;
    this.produtos.removeAt(index);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
