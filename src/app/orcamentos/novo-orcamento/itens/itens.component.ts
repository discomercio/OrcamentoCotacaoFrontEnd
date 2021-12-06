import { Component, OnInit, ViewChild } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup, EmailValidator } from '@angular/forms';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { SelecProdInfo } from '../select-prod-dialog/selec-prod-info';
import { SelectProdDialogComponent } from '../select-prod-dialog/select-prod-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ProdutoTela } from '../select-prod-dialog/produto-tela';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api/selectitem';
import { PagtoOpcao } from 'src/app/dto/forma-pagto/pagto-opcao';
import { Constantes } from 'src/app/utilities/constantes';
import { VisualizarOrcamentoComponent } from '../visualizar-orcamento/visualizar-orcamento.component';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { arrayToHash } from '@fullcalendar/core/util/object';
import { ValidacoesUtils } from 'src/app/utilities/validacao-formulario/validacoesUtils';
import { AlertDialogComponent } from 'src/app/utilities/alert-dialog/alert-dialog.component';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';

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
    public mensagemService: MensagemService,
    public readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly orcamentoService: OrcamentosService) { }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  stringUtils = StringUtils;
  moedaUtils: MoedaUtils = new MoedaUtils();
  lstProdutos: ProdutoOrcamentoDto[] = new Array();
  pagtoSelecionados: string[] = new Array();
  observacaoOpcao: string;
  observacoesGerais: string;
  opcoesPagto: PagtoOpcao[];
  public constantes: Constantes = new Constantes();

  ngOnInit(): void {
    this.inscreveProdutoComboDto();
    this.montarOpcoesPagto();
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    console.log("itens iniciou");
  }

  ngAfterViewInit() {
    setTimeout(() => {
      document.getElementById("p-tabpanel-1-label").click();
    }, 10);
  }

  produtoComboDto: ProdutoComboDto;
  inscreveProdutoComboDto(): void {
    this.produtoService.buscarProdutosCompostosXSimples("1",
      this.novoOrcamentoService.pageItens.toString(),
      this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.id).toPromise().then((r) => {
        // debugger;
        if (r != null) {
          this.produtoComboDto = r;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  montarOpcoesPagto() {
    this.opcoesPagto = new Array();

    let opcao1: PagtoOpcao = new PagtoOpcao();
    opcao1.codigo = this.constantes.COD_PAGTO_AVISTA;
    opcao1.descricao = "Á vista (3% desconto)";
    opcao1.incluir = false;
    opcao1.qtdeParcelas = 1;
    this.opcoesPagto.push(opcao1);

    let opcao2: PagtoOpcao = new PagtoOpcao();
    opcao2.codigo = this.constantes.COD_PAGTO_PARCELADO;
    opcao2.descricao = "Parcelado";
    opcao2.incluir = false;
    opcao2.qtdeParcelas = 10;
    this.opcoesPagto.push(opcao2);
  }

  adicionarProduto(): void {
    this.mostrarProdutos(null);
  }

  selecProdInfo = new SelecProdInfo();
  mostrarProdutos(linha: ProdutoOrcamentoDto): void {
    this.selecProdInfo.produtoComboDto = this.produtoComboDto;
    this.selecProdInfo.ClicouOk = false;
    let largura: string = this.novoOrcamentoService.onResize() ? "" : "65vw";
    const ref = this.dialogService.open(SelectProdDialogComponent,
      {
        width: largura,
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

  visualizarOrcamento() {
    // if (this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length <= 0) {
    //   this.mensagemService.showWarnViaToast("Favor incluir opção de orçamento!");
    //   return;
    // }

    let largura: string = this.novoOrcamentoService.onResize() ? "" : "85vw";
    const ref = this.dialogService.open(VisualizarOrcamentoComponent, {
      width: largura,
      styleClass: 'dynamicDialog',
      header: "Orçamentos"
    })
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
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.ListaProdutos = this.lstProdutos;
    this.novoOrcamentoService.totalPedido();
    this.novoOrcamentoService.totalPedidoRA();
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

  formataPreco_Venda(e: Event, item: ProdutoOrcamentoDto): void {
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

  selecionaOpcaoPagto(pagto: PagtoOpcao) {
    pagto.incluir = true;
  }

  incluirOpcao() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length == 3) {
      this.mensagemService.showWarnViaToast("É permitido incluir somente 3 opções de orçamento!");
      return;
    }
    if (this.pagtoSelecionados.length <= 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione as opções de pagamento!");
      return;
    }
    if (this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.ListaProdutos.length == 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione ao menos um produto!");
      return;
    }
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.Observacoes = this.observacaoOpcao;
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.FormaPagto = this.novoOrcamentoService.atribuirOpcaoPagto(this.opcoesPagto);
    this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.push(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto);

    //vamos salvar a opção


    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.limparCampos();
  }
  incluirObsGerais() {
    if (this.observacoesGerais) {
      // this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ObservacoesGerais = this.observacoesGerais;
    }
  }

  limparCampos() {
    this.lstProdutos = new Array();
    this.pagtoSelecionados = new Array();
  }

  removerOpcao(index: number) {
    this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.splice(index - 1, 1);
  }

  removerItem(index: number) {
    this.lstProdutos.splice(index, 1);
  }

  enviar() {
    ;
    // validar se a forma de pagto esta preenchida em cada orçamento
    // validar os produtos e valores??
    // precisa fazer a parte de desconto, analisar os arquivos do Edu para ver o percentual máximo
    // precisa analisar melhor essa parte
    /* 
      se ultrapassar o percentual máximo de desconto, 
      vamos mostrar uma mensagem com uma modal para que a pessoa clique no OK 
      e mostrar o botão para solicitar o desconto superior
     */
  }

  salvarOrcamento() {
    ;
    //depois de validar o orçamento vamos salvar!
    // fazer a chamada da validação aqui

    // this.orcamentoService.enviarOrcamento(this.novoOrcamentoService.opcoesOrcamentoCotacaoDto).toPromise().then(r =>{
    //   if(r == null){
    //     this.alertaService.mostrarMensagem("Deu pau");
    //   }
    // }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

}
