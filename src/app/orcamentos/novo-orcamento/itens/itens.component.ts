import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  listaProdutosSelecionado: ProdutoOrcamentoDto[];
  stringUtils = StringUtils;
  moedaUtils: MoedaUtils = new MoedaUtils();

  ngOnInit(): void {
    console.log(this.novoOrcamentoService.orcamentoCotacaoDto);
    this.criarForm();
    // this.lista();
    this.listaProdutosSelecionado = new Array<ProdutoOrcamentoDto>();
  }

  lista() {
    let prod: ProdutoOrcamentoDto = new ProdutoOrcamentoDto();
    prod.Fabricante = "001";
    prod.Produto = this.listaProdutosSelecionado.length > 0 ? this.listaProdutosSelecionado.length > 1 ? "001092" : "001091" : "001090";
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

    this.listaProdutosSelecionado.push(prod);
  }

  criarForm() {
    this.form = this.fb.group({});
  }

  incluirProduto() {
    
  }

  produtoSelecionado: ProdutoOrcamentoDto;
  removerItem(event: HTMLElement) {
    let produto: string = event.getElementsByTagName('input')[0].value;
    this.listaProdutosSelecionado = this.listaProdutosSelecionado.filter(f => f.Produto != produto);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if(window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
