import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { PagtoOpcao } from 'src/app/dto/forma-pagto/pagto-opcao';
import { Constantes } from 'src/app/utilities/constantes';
import { VisualizarOrcamentoComponent } from '../visualizar-orcamento/visualizar-orcamento.component';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from 'events';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { AprovarOrcamentoComponent } from '../aprovar-orcamento/aprovar-orcamento.component';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  styleUrls: ['./itens.component.scss']
})
export class ItensComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private produtoService: ProdutoService,
    public dialogService: DialogService,
    public mensagemService: MensagemService,
    public readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    private readonly formaPagtoService: FormaPagtoService,
    telaDesktopService: TelaDesktopService) {
    super(telaDesktopService);
  }

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

  dtOptions: any = {};

  ngOnInit(): void {
    debugger;
    if(!this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto){
      this.router.navigate(["/novo-orcamento/cadastrar-cliente"]);
      return;
    }
    this.inscreveProdutoComboDto();
    this.buscarQtdeMaxParcelaCartaoVisa();

    this.novoOrcamentoService.criarNovoOrcamentoItem();
  }

  carregandoProds = true;
  produtoComboDto: ProdutoComboDto;
  inscreveProdutoComboDto(): void {
    this.produtoService.buscarProdutosCompostosXSimples(
      this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.loja,
      this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.uf, 
      this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.tipo).toPromise().then((r) => {

        if (r != null) {
          this.produtoComboDto = r;
          this.carregandoProds = false;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }
  qtdeMaxParcelaCartaoVisa: number = 0;
  buscarQtdeMaxParcelaCartaoVisa() {
    this.formaPagtoService.buscarQtdeMaxParcelaCartaoVisa().toPromise().then((r) => {
      if (r == null) {
        this.alertaService.mostrarMensagem("Erro ao buscar a quantidade máxima de parcelas.");
        return;
      }
      this.qtdeMaxParcelaCartaoVisa = r;
      this.montarOpcoesPagto();
    }).catch((error) => {
      this.alertaService.mostrarErroInternet(error);
      return;
    });
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
    opcao2.qtdeParcelas = this.qtdeMaxParcelaCartaoVisa;
    this.opcoesPagto.push(opcao2);
  }
  clicouAddProd: boolean = true;
  adicionarProduto(): void {
    this.clicouAddProd = true;
    this.mostrarProdutos(null);
  }

  verificarCargaProdutos(): boolean {
    if (this.carregandoProds) {
      //ainda não carregou, vamos esperar....
      return false;
    }
    return true;
  }

  selecProdInfo = new SelecProdInfo();
  mostrarProdutos(linha: ProdutoOrcamentoDto): void {
    if (!this.verificarCargaProdutos()) {
      return;
    }
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
        let filtro = this.lstProdutos.filter(f => f.produto == resultado.produtoDto.produto);
        if (filtro.length > 0) {
          filtro[0].qtde++;
          this.digitouQte(filtro[0]);
          return;
        }

        this.inserirProduto(resultado);
      }
    });
  }

  visualizarOrcamento() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.length <= 0) {
      this.mensagemService.showWarnViaToast("Favor incluir opção de orçamento!");
      return;
    }

    this.router.navigate(["orcamentos/novo-orcamento/aprovar-orcamento", {aprovando: false }]);
    // let largura: string = this.novoOrcamentoService.onResize() ? "" : "85vw";
    // const ref = this.dialogService.open(AprovarOrcamentoComponent, {
    //   width: largura,
    //   styleClass: 'dynamicDialog',
    //   header: "Orçamentos"
    // })
  }

  inserirProduto(produto: ProdutoTela): void {
    let prod: ProdutoOrcamentoDto = new ProdutoOrcamentoDto();
    prod.fabricante = produto.produtoDto.fabricante;
    prod.produto = produto.produtoDto.produto;
    prod.fabricanteNome = produto.produtoDto.fabricanteNome;
    prod.descricao = produto.produtoDto.descricaoHtml;
    prod.qtde = 1;

    let precoLista = Number.parseFloat(produto.produtoDto.precoLista.toFixed(2));
    prod.precoNF = precoLista;
    prod.precoLista = precoLista;
    prod.descDado = 0;
    prod.precoVenda = precoLista;
    prod.totalItem = precoLista;
    prod.totalItemRA = precoLista;
    prod.alterouValorRa = false;
    prod.alterouPrecoVenda = false;
    prod.coeficienteDeCalculo = produto.Filhos.length == 0 ? parseFloat(produto.produtoDto.coeficienteDeCalculo.toFixed(2)) : produto.Filhos[0].coeficienteDeCalculo;
    prod.mostrarCampos = this.telaDesktop ? true : false;

    this.lstProdutos.push(prod);
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos = this.lstProdutos;

    this.novoOrcamentoService.totalPedido();
    this.novoOrcamentoService.totalPedidoRA();
  }

  digitouQte(item: ProdutoOrcamentoDto): void {
    if (item.qtde <= 0) item.qtde = 1;

    item.totalItem = item.precoVenda * item.qtde;

    // if(PermiteRAStatus)
    item.totalItemRA = item.precoNF * item.qtde;
  }

  digitouPreco_NF(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = Number.parseFloat((v / 100).toFixed(2) + '');

    if (Number.parseFloat(item.precoLista.toFixed(2)) === v) item.alterouValorRa = false;
    else item.alterouValorRa = true;

    item.precoNF = this.moedaUtils.formatarDecimal(v);
    item.totalItemRA = item.precoNF * item.qtde;

    this.somarRA();
  }

  formatarPreco_NF(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    if (valor != "") {
      let v: any = valor.replace(/\D/g, '');
      v = Number.parseFloat((v / 100).toFixed(2) + '');
      item.precoNF = this.moedaUtils.formatarDecimal(v);
    }
  }

  formatarDesc(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    if (!isNaN(v)) {
      v = (v / 100).toFixed(2) + '';
      item.descDado = v;
    }
  }

  digitouDesc(e: Event, item: ProdutoOrcamentoDto): void {

    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    v = (v / 100).toFixed(2) + '';

    //se o desconto for digitado estamos alterando o valor de venda e não devemos mais alterar esse valor
    if (item.descDado == 0 || item.descDado.toString() == '') {
      item.alterouPrecoVenda = false;
    } else {
      item.alterouPrecoVenda = true;
    }

    this.digitouDescValor(item, v);
  }

  digitouDescValor(item: ProdutoOrcamentoDto, v: string): void {
    if (item.descDado === Number.parseFloat(v)) {
      if (item.descDado == 0) {
        item.descDado = 0;
      }
      return;
    }

    item.descDado = Number.parseFloat(v);

    if (item.descDado > 100) {
      item.descDado = 100;
    }

    if (item.descDado) {
      item.precoVenda = item.precoLista * (1 - item.descDado / 100);
      item.precoVenda = Number.parseFloat(item.precoVenda.toFixed(2));
    }
    else {
      item.precoVenda = item.precoLista;
    }
    this.digitouQte(item);
  }

  formataPreco_Venda(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    if (valor != "") {
      let v: any = valor.replace(/\D/g, '');
      v = Number.parseFloat((v / 100).toFixed(2) + '');
      item.precoVenda = this.moedaUtils.formatarDecimal(v);
    }
  }
  digitouPreco_Venda(e: Event, item: ProdutoOrcamentoDto) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';

    item.totalItem = item.qtde * item.precoLista;
    item.totalItem = item.qtde * item.precoLista;

    item.descDado = 100 * (item.precoLista - v) / item.precoLista;
    //calcula o desconto
    item.descDado = this.moedaUtils.formatarDecimal(item.descDado);

    if (item.precoLista == item.precoVenda) {
      item.alterouPrecoVenda = false;
    } else {
      item.alterouPrecoVenda = true;
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
    let pc = this.produtoComboDto.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
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
        let produto = this.produtoComboDto.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
        produto.filhos.forEach(i => {
          if (i.alertas) {
            retorno = true;
            this.mensagemAlerta = i.alertas;
          }
        });
      }
      if (!this.confirmaProdutoComposto(item)) {
        let produto = this.produtoComboDto.produtosSimples.filter(f => f.produto == item.produto)[0];
        if (produto.alertas) {
          retorno = true;
          this.mensagemAlerta = produto.alertas;
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
      let produto = this.produtoComboDto.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
      let excede: boolean = false;
      produto.filhos.forEach(i => {
        if (i.estoque < item.qtde) {
          excede = true;
          return;
        }
      });
      return excede;
    }
    if (!this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.produtosSimples.filter(f => f.produto == item.produto)[0];
      if (produto.estoque < item.qtde) {
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
      let produto = this.produtoComboDto.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
      let excede: boolean = false;
      produto.filhos.forEach(i => {
        if (i.qtdeMaxVenda < item.qtde) {
          excede = true;
          return;
        }
      });
      return excede;
    }
    if (!this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto.produtosSimples.filter(f => f.produto == item.produto)[0];
      if (produto.qtdeMaxVenda < item.qtde) {
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
    if (this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos.length == 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione ao menos um produto!");
      return;
    }
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.idOrcamento = this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.id;
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.observacoes = this.observacaoOpcao;
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.formaPagto = this.novoOrcamentoService.atribuirOpcaoPagto(this.opcoesPagto, this.qtdeMaxParcelaCartaoVisa);

    this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.push(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto);
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.limparCampos();

  }

  limparCampos() {
    this.lstProdutos = new Array();
    this.pagtoSelecionados = new Array();
    this.observacaoOpcao = null;
  }

  removerOpcao(index: number) {
    debugger;
    if (this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.id) {
      this.orcamentoOpcaoService.removerOrcamentoOpcao().toPromise().then((r) => {
        if (r != null) {

          this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto.splice(index - 1, 1);
        }
      }).catch((error: HttpErrorResponse) => {
        this.mensagemService.showErrorViaToast(error.error.errors);
        return;
      });
    }
  }

  removerItem(index: number) {
    this.lstProdutos.splice(index, 1);
  }

  mostrando: boolean = false;
  mostrarIrmaos(e: any, produto: ProdutoOrcamentoDto) {

    if (this.telaDesktop) return;

    let n = e.srcElement.closest("td"), ret = [];

    if (produto.mostrarCampos) {
      n.children[0].children[0].classList.remove("pi-chevron-circle-up");
      n.children[0].children[0].classList.add("pi-chevron-circle-down");
    }
    else {
      n.children[0].children[0].classList.remove("pi-chevron-circle-down");
      n.children[0].children[0].classList.add("pi-chevron-circle-up");
    }

    produto.mostrarCampos = produto.mostrarCampos ? false : true;

    this.ajustaDisplayTable(n, produto);

  }

  ajustaDisplayTable(n: any, produto: ProdutoOrcamentoDto) {

    while (n = <HTMLTableDataCellElement>n.nextElementSibling) {
      if (!this.telaDesktop) {
        if (!produto.mostrarCampos) {
          n.classList.add("p-d-inline-flex");
        }
        else {
          n.classList.remove("p-d-inline-flex");
          n.style.display = "none";
        }
      }
      else {
        n.style.display = "table-cell";
      }
    }
  }

  salvarOrcamento(){
    this.mensagemService.showWarnViaToast("Estamos implementando!");
    return;
  }
  enviar(){
    this.mensagemService.showWarnViaToast("Estamos implementando!");
    return;
  }
}
