import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup } from '@angular/forms';

import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { SelecProdInfo } from '../select-prod-dialog/selec-prod-info';
import { SelectProdDialogComponent } from '../select-prod-dialog/select-prod-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ProdutoTela } from '../select-prod-dialog/produto-tela';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { Router } from '@angular/router';
import { Constantes } from 'src/app/utilities/constantes';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { FormaPagtoComponent } from '../forma-pagto/forma-pagto.component';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { getLocaleDateTimeFormat } from '@angular/common';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';

import { LojasService } from 'src/app/service/lojas/lojas.service';
import { PercMaxDescEComissaoResponseViewModel } from 'src/app/dto/percentual-comissao';
import { OpcoesComponent } from '../opcoes/opcoes.component';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { CoeficienteRequest } from 'src/app/dto/produtos/coeficienteRequest';
import { ProdutoFilhoDto } from 'src/app/dto/produtos/produto-filhoDto';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  styleUrls: ['./itens.component.scss']
})
export class ItensComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  constructor(private fb: FormBuilder,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private produtoService: ProdutoService,
    public dialogService: DialogService,
    public mensagemService: MensagemService,
    public readonly router: Router,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    telaDesktopService: TelaDesktopService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly lojaService: LojasService,
    private readonly orcamentosService: OrcamentosService,
    private readonly sweetalertService: SweetalertService) {
    super(telaDesktopService);
  }

  @ViewChild('dataTable') table: Table;
  public form: FormGroup;
  stringUtils = StringUtils;
  moedaUtils: MoedaUtils = new MoedaUtils();
  pagtoSelecionados: string[] = new Array();
  observacaoOpcao: string;
  observacoesGerais: string;
  public constantes: Constantes = new Constantes();
  usuario = new Usuario();
  tipoUsuario: number;
  dtOptions: any = {};
  produtoComboDto: ProdutoComboDto;
  carregandoProds = true;
  qtdeMaxParcelaCartaoVisa: number = 0;
  clicouAddProd: boolean = true;
  selecProdInfo = new SelecProdInfo();

  ngOnInit(): void {

    if (!this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto) {
      this.router.navigate(["orcamentos/cadastrar-cliente"]);
      return;
    }

    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.tipoUsuario = this.autenticacaoService.tipoUsuario;

    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.buscarPercentualComissao();
  }

  async ngAfterViewInit() {
    await this.formaPagto.buscarFormasPagto();
    this.inscreveProdutoComboDto();
  }

  @ViewChild("formaPagto", { static: false }) formaPagto: FormaPagtoComponent;
  @ViewChild("opcoes", { static: false }) opcoes: OpcoesComponent;

  inscreveProdutoComboDto(): void {
    let produtoRequest: ProdutoRequest = new ProdutoRequest();
    produtoRequest.loja = this.novoOrcamentoService.orcamentoCotacaoDto.loja;
    produtoRequest.uf = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf;
    produtoRequest.tipoCliente = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    produtoRequest.tipoParcela = this.novoOrcamentoService.siglaPagto;
    produtoRequest.qtdeParcelas = this.formaPagto.qtdeMaxParcelas;
    produtoRequest.dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString().slice(0, 10));

    this.produtoService.buscarProdutosCompostosXSimples(produtoRequest).toPromise().then((r) => {
      if (r != null) {
        this.produtoComboDto = r;
        this.carregandoProds = false;
      }
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregandoProds = false;
    });
  }

  adicionarProduto(): void {
    this.clicouAddProd = true;
    this.mostrarProdutos(null);
  }
  mostrarPercrt: boolean = false;
  buscarPercentualComissao() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro == this.constantes.SEM_INDICADOR) {
      this.novoOrcamentoService.percentualMaxComissao = undefined;
      return;
    }
    this.lojaService.buscarPercentualComissao(this.usuario.loja).toPromise().then((r) => {
      if (r != null) {
        this.novoOrcamentoService.percentualMaxComissao = r;
        this.novoOrcamentoService.setarPercentualComissao();
      }
    }).catch(e => this.alertaService.mostrarErroInternet(e));
  }

  verificarCargaProdutos(): boolean {
    if (this.carregandoProds) {
      //ainda não carregou, vamos esperar....
      return false;
    }
    return true;
  }

  async mostrarProdutos(linha: ProdutoOrcamentoDto) {
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
        let filtro2 = this.produtoComboDto.produtosSimples.filter(x => x.produto == resultado.produtoDto.produto)[0];
        let produtoOrcamento: ProdutoOrcamentoDto = new ProdutoOrcamentoDto();
        produtoOrcamento.fabricante = filtro2.fabricante;
        produtoOrcamento.fabricanteNome = filtro2.fabricante_Nome;
        produtoOrcamento.produto = filtro2.produto;
        produtoOrcamento.descricao = filtro2.descricaoHtml;
        produtoOrcamento.precoListaBase = filtro2.precoListaBase;
        produtoOrcamento.precoLista = filtro2.precoLista;
        produtoOrcamento.coeficienteDeCalculo = 0;
        produtoOrcamento.descDado = 0;
        produtoOrcamento.precoNF = filtro2.precoLista;
        produtoOrcamento.precoVenda = filtro2.precoLista;
        produtoOrcamento.qtde = 1;
        produtoOrcamento.totalItem = produtoOrcamento.precoVenda * produtoOrcamento.qtde;
        produtoOrcamento.alterouPrecoVenda = false;
        produtoOrcamento.mostrarCampos = this.telaDesktop ? true : false;


        this.arrumarProdutosRepetidos(produtoOrcamento);

        this.inserirProduto(produtoOrcamento);
        this.digitouQte(produtoOrcamento);

      }
    });
  }

  arrumarProdutosRepetidos(produto: ProdutoOrcamentoDto) {
    let repetidos = this.novoOrcamentoService.lstProdutosSelecionados.filter(x => x.produto == produto.produto);

    if (repetidos.length >= 1) {
      this.novoOrcamentoService.lstProdutosSelecionados.forEach(x => {
        const index = this.novoOrcamentoService.lstProdutosSelecionados.findIndex(f => f.produto == produto.produto);
        if (x.produto == produto.produto) {
          x.qtde++;
          this.digitouQte(x);
          return;
        }
      });
    }
    else {
      this.novoOrcamentoService.lstProdutosSelecionados.push(produto);
    }
  }

  inserirProduto(produto: ProdutoOrcamentoDto): void {
    let coeficienteRequest: CoeficienteRequest = new CoeficienteRequest();
    coeficienteRequest.lstFabricantes = new Array();

    this.novoOrcamentoService.lstProdutosSelecionados.forEach(x => { coeficienteRequest.lstFabricantes.push(x.fabricante) });
    coeficienteRequest.dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString().slice(0, 10));
    this.produtoService.buscarCoeficientes(coeficienteRequest).toPromise().then((r) => {
      if (r != null) {
        this.novoOrcamentoService.recalcularProdutosComCoeficiente(this.formaPagto.buscarQtdeParcelas(), r);
        if (this.novoOrcamentoService.qtdeParcelas) {
          this.formaPagto.setarValorParcela(this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas);
          this.formaPagto.calcularValorAvista();
        }

      }
    }).catch((e) => { this.mensagemService.showErrorViaToast(["Falha ao buscar lista de coeficientes!"]) });


    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos = this.novoOrcamentoService.lstProdutosSelecionados;

    this.novoOrcamentoService.totalPedido();
    this.formaPagto.habilitar = false;
  }

  digitouQte(item: ProdutoOrcamentoDto): void {
    if (item.qtde <= 0) item.qtde = 1;

    item.totalItem = item.precoVenda * item.qtde;


    this.formaPagto.setarValorParcela(this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas);
    this.formaPagto.calcularValorAvista();
    if (this.novoOrcamentoService.percentualMaxComissao)
      this.calcularPercentualComissao();
  }

  digitouPreco_NF(e: Event, item: ProdutoOrcamentoDto): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = Number.parseFloat((v / 100).toFixed(2) + '');

    item.precoNF = this.moedaUtils.formatarDecimal(v);
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

  calcularPercentualComissao() {
    let totalSemDesc = this.moedaUtils
      .formatarDecimal(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos
        .reduce((sum, current) => sum + this.moedaUtils
          .formatarDecimal((current.precoLista) * current.qtde), 0));
    let totalComDesc = this.novoOrcamentoService.totalPedido();
    let descMedio = (((totalSemDesc - totalComDesc) / totalSemDesc) * 100);
    if (descMedio > (this.novoOrcamentoService.percentualMaxComissao.percMaxComissaoEDesconto - this.novoOrcamentoService.percentualMaxComissao.percMaxComissao)) {
      let descontarComissao = this.moedaUtils.formatarDecimal(this.novoOrcamentoService.percentualMaxComissao.percMaxComissao - descMedio);

      if (descontarComissao != 0) {
        let descMax = this.novoOrcamentoService.percentualMaxComissao.percMaxComissaoEDesconto - this.novoOrcamentoService.percentualMaxComissao.percMaxComissao;
        this.moedaUtils.formatarDecimal(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = this.novoOrcamentoService.percentualMaxComissao.percMaxComissao - (descMedio - descMax));
      }
    }
    else {
      this.moedaUtils.formatarDecimal(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = this.novoOrcamentoService.percentualMaxComissao.percMaxComissao);
    }

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
    item.descDado = this.moedaUtils.formatarDecimal(item.descDado);

    if (item.precoLista == item.precoVenda) {
      item.alterouPrecoVenda = false;
    } else {
      item.alterouPrecoVenda = true;
    }

    this.digitouQte(item);
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
        // produto.filhos.forEach(i => {
        //   if (i.alertas) {
        //     retorno = true;
        //     this.mensagemAlerta = i.alertas;
        //   }
        // });
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
      // produto.filhos.forEach(i => {
      //   if (i.estoque < item.qtde) {
      //     excede = true;
      //     return;
      //   }
      // });
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
      // produto.filhos.forEach(i => {
      //   if (i.qtdeMaxVenda < item.qtde) {
      //     excede = true;
      //     return;
      //   }
      // });
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

  removerItem(index: number) {
    let produto = this.novoOrcamentoService.lstProdutosSelecionados.splice(index, 1)[0];

    this.removerProdutoDaListaControle(produto);

    this.digitouQte(produto);
  }

  removerProdutoDaListaControle(produto: ProdutoOrcamentoDto) {
    let prodFilter = this.produtoComboDto.produtosCompostos.filter(x => x.paiProduto == produto.produto)[0];
    if (prodFilter) {
      prodFilter.filhos.forEach(x => {
        let filho = this.novoOrcamentoService.controleProduto.filter(c => c == x.produto)[0];
        let prodSelecionado = this.novoOrcamentoService.lstProdutosSelecionados.filter(s => s.produto == x.produto)[0];
        if (filho && !prodSelecionado) {
          let index = this.novoOrcamentoService.controleProduto.indexOf(filho);
          this.novoOrcamentoService.controleProduto.splice(index, 1);
        }
      });
    }
    else {
      let index: number;
      let filho: ProdutoFilhoDto;

      this.produtoComboDto.produtosCompostos.some(x => {
        filho = x.filhos.filter(f => f.produto == produto.produto)[0];
        if (filho) {
          let pai = this.novoOrcamentoService.lstProdutosSelecionados.filter(p => p.produto == x.paiProduto)[0];
          if (!pai) {
            filho = null;
          }
          return true;
        }
      });
      if (!filho) {
        index = this.novoOrcamentoService.controleProduto.indexOf(produto.produto);
        this.novoOrcamentoService.controleProduto.splice(index, 1);
      }
    }
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



  salvarOrcamento() {

    this.orcamentosService.enviarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto).toPromise().then((r) => {
      if (r != null) {
        this.sweetalertService.sucesso("Orçamento salvo!");
        this.novoOrcamentoService.criarNovo();
        this.router.navigate(["orcamentos/listar", "orcamentos"]);
      }
    }).catch((e) => {
      debugger;
      this.alertaService.mostrarErroInternet(e)
    });
  }

  visualizarOrcamento(id: number) {
    this.mensagemService.showWarnViaToast("Estamos implementando!");
    // this.router.navigate(["orcamentos/visualizar-orcamento", id]);
  }

  enviar() {

    return;
  }
}
