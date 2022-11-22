import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup } from '@angular/forms';

import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { DialogService } from 'primeng/dynamicdialog';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Constantes } from 'src/app/utilities/constantes';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { FormaPagtoComponent } from '../forma-pagto/forma-pagto.component';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';

import { LojasService } from 'src/app/service/lojas/lojas.service';
import { OpcoesComponent } from '../opcoes/opcoes.component';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';
import { CoeficienteRequest } from 'src/app/dto/produtos/coeficienteRequest';
import { ProdutoFilhoDto } from 'src/app/dto/produtos/produto-filhoDto';
import { Location } from '@angular/common';
import { SelecProdInfo } from '../select-prod-dialog/selec-prod-info';
import { SelectProdDialogComponent } from '../select-prod-dialog/select-prod-dialog.component';
import { ProdutoTela } from '../select-prod-dialog/produto-tela';
import { SelectCloneOpcoesDialogComponent } from '../select-clone-opcoes-dialog/select-clone-opcoes-dialog.component';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
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
    public readonly orcamentosService: OrcamentosService,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    public cdref: ChangeDetectorRef) {
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
  clicouAddProd: boolean = true;
  selecProdInfo = new SelecProdInfo();
  param: string;
  habilitarClone: boolean = false;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((param: any) => { this.verificarParam(param); });
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.novoOrcamentoService.descontoGeral = 0;

  }
  editando: boolean = false;
  verificarParam(param: any) {

    if (param.filtro == undefined) {
      this.editando = true;
      this.carregandoProds = false;
    }
    if (param.filtro == "novo" || param.filtro == "iniciar") {
      this.param = "novo";
      this.novoOrcamentoService.editarComissao = false;
      this.novoOrcamentoService.editando = false;
      this.novoOrcamentoService.calcularComissaoAuto = this.novoOrcamentoService.verificarCalculoComissao();
    }
    if (param.filtro == "clone") {
      this.param = param.filtro;
      this.habilitarClone = true;
      //precisamos clonar as opções
      this.novoOrcamentoService.calcularComissaoAuto = this.novoOrcamentoService.verificarCalculoComissao();
    }
    this.iniciarNovo();
    this.buscarPercentualComissao();
  }

  abriModalOpcoes() {
    if (this.carregandoProds) {
      //ainda não carregou, vamos esperar....
      return false;
    }

    if (this.novoOrcamentoService.lstProdutosSelecionados.length > 0) {
      this.sweetalertService.dialogo("Atenção", "Ao clonar uma opção a lista de produtos e formas de pagamentos serão sobrepostas!")
        .subscribe(retorno => {
          if (!retorno) {
            return;
          }
          this.novoOrcamentoService.lstProdutosSelecionados = new Array<ProdutoOrcamentoDto>();
          //vamos abrir a modal
          this.mostrarOpcoesClone();
          return;
        });
    }
    else {
      //vamos abrir, pois não tem produtos
      this.mostrarOpcoesClone();
    }

  }

  mostrarOpcoesClone() {
    this.selecProdInfo.produtoComboDto = this.produtoComboDto;
    let largura: string = this.novoOrcamentoService.onResize() ? "" : "85vw";
    const ref = this.dialogService.open(SelectCloneOpcoesDialogComponent,
      {
        width: largura,
        styleClass: 'dynamicDialog',
        data: this.selecProdInfo
      });

    ref.onClose.subscribe((resultado: any) => {
      if (resultado) {
        this.addListaProdutosClonados(resultado.produtos);
        this.addFormaPagtoClonados(resultado.formasPagtos);
      }
    });
  }

  addFormaPagtoClonados(formasPagtos: any[]) {
    //acho que precisamos verificar os tipos dos pagamentos para poder atribuir nos lugares certos
    let pagtoAvista = formasPagtos.filter(x => x.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA);
    if (pagtoAvista.length > 0) {
      this.formaPagto.formaPagtoCriacaoAvista = pagtoAvista[0];
      this.formaPagto.checkedAvista = true;
      this.formaPagto.calcularValorAvista();
    }

    let pagtoPrazo = formasPagtos.filter(x => x.tipo_parcelamento != this.constantes.COD_FORMA_PAGTO_A_VISTA);
    if (pagtoPrazo.length > 0) {
      this.formaPagto.formaPagtoCriacaoAprazo = pagtoPrazo[0];
      this.formaPagto.setarQtdeParcelas();
      this.novoOrcamentoService.qtdeParcelas;
      this.formaPagto.setarSiglaPagto();
    }
    this.formaPagto.atribuirFormasPagto();
  }

  addListaProdutosClonados(lstProdutosClonados: ProdutoTela[]) {
    let produtoOrcamento: ProdutoOrcamentoDto[] = new Array<ProdutoOrcamentoDto>();

    lstProdutosClonados.forEach(produto => {
      let item = this.montarProdutoParaAdicionar(produto)
      if (!this.arrumarProdutosRepetidos(item))
        produtoOrcamento.push(item);
    });

    this.inserirProduto();

    produtoOrcamento.forEach(item => {
      this.digitouQte(item);
    });
  }

  iniciarNovo() {
    if (!this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto) {
      this.router.navigate(["orcamentos/cadastrar-cliente", "novo"]);
      return;
    }

    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.novoOrcamentoService.tipoUsuario = this.autenticacaoService._tipoUsuario;
  }

  async ngAfterViewInit() {

    if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto == undefined ||
      this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto == null) {
      this.router.navigate(["orcamentos/cadastrar-cliente", this.param]);
      return;
    }

    await this.formaPagto.buscarFormasPagto(this.param);

    // if (this.param != undefined) {
    this.formaPagto.formaPagtoService.buscarQtdeMaxParcelaCartaoVisa().toPromise().then((r) => {
      if (r != null) {
        this.formaPagto.qtdeMaxParcelas = r;
        this.formaPagto.qtdeMaxParcelaCartaoVisa = r;

        this.formaPagto.setarTipoPagto();
        this.inscreveProdutoComboDto();
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregandoProds = false;
    });
    // }

    if (this.editando) this.formaPagto.editando = true;
  }

  @ViewChild("formaPagto", { static: false }) formaPagto: FormaPagtoComponent;
  @ViewChild("opcoes", { static: false }) opcoes: OpcoesComponent;

  inscreveProdutoComboDto(): void {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.loja == undefined) return;

    let produtoRequest: ProdutoRequest = new ProdutoRequest();
    produtoRequest.loja = this.novoOrcamentoService.orcamentoCotacaoDto.loja;
    produtoRequest.uf = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf;
    produtoRequest.tipoCliente = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    produtoRequest.tipoParcela = this.novoOrcamentoService.siglaPagto;
    produtoRequest.qtdeParcelas = this.formaPagto.qtdeMaxParcelas;
    produtoRequest.dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));

    this.produtoService.buscarProdutosCompostosXSimples(produtoRequest).toPromise().then((r) => {
      if (r != null) {

        this.produtoComboDto = r;
        this.carregandoProds = false;
        this.cdref.detectChanges();
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
    if (this.usuario.loja == undefined) return;

    this.lojaService.buscarPercentualComissao(this.usuario.loja, this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo).toPromise().then((r) => {
      if (r != null) {
        this.novoOrcamentoService.percentualMaxComissao = r;
        this.novoOrcamentoService.percentualMaxComissaoPadrao = r;

        if (!this.novoOrcamentoService.editando) {
          this.novoOrcamentoService.setarPercentualComissao();
          return;
        }

        if (this.tipoUsuario == this.constantes.PARCEIRO || this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
          this.novoOrcamentoService.setarPercentualComissao();
          this.novoOrcamentoService.calcularPercentualComissao();
        }
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
        this.addProdutoSelecionado(resultado);
      }
    });
  }

  montarProdutoParaAdicionar(produto: ProdutoTela): ProdutoOrcamentoDto {
    let filtro2 = this.produtoComboDto.produtosSimples.filter(x => x.produto == produto.produtoDto.produto)[0];
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
    produtoOrcamento.qtde = produto.qtde;
    produtoOrcamento.totalItem = produtoOrcamento.precoVenda * produtoOrcamento.qtde;
    produtoOrcamento.alterouPrecoVenda = false;
    produtoOrcamento.mostrarCampos = this.telaDesktop ? true : false;
    return produtoOrcamento;
  }

  addProdutoSelecionado(produto: ProdutoTela) {
    let filtro2 = this.produtoComboDto.produtosSimples.filter(x => x.produto == produto.produtoDto.produto)[0];

    let produtoOrcamento: ProdutoOrcamentoDto = this.montarProdutoParaAdicionar(produto);

    if (this.arrumarProdutosRepetidos(produtoOrcamento)) return;

    this.inserirProduto();
    this.digitouQte(produtoOrcamento);
  }

  arrumarProdutosRepetidos(produto: ProdutoOrcamentoDto): boolean {
    let repetidos = this.novoOrcamentoService.lstProdutosSelecionados.filter(x => x.produto == produto.produto);

    if (repetidos.length >= 1) {
      return this.novoOrcamentoService.lstProdutosSelecionados.some(x => {
        const index = this.novoOrcamentoService.lstProdutosSelecionados.findIndex(f => f.produto == produto.produto);
        if (x.produto == produto.produto) {
          x.qtde++;
          this.digitouQte(x);
          return true;
        }
      });
    }
    else {
      this.novoOrcamentoService.lstProdutosSelecionados.push(produto);
      return false;
    }
  }

  inserirProduto(): void {

    let dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    if (!this.editando)
      this.buscarCoeficientes(dataRefCoeficiente);

    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos = this.novoOrcamentoService.lstProdutosSelecionados;

    this.novoOrcamentoService.totalPedido();

    this.formaPagto.habilitar = false;
  }

  buscarCoeficientes(dataReferencia: string) {
    let coeficienteRequest: CoeficienteRequest = new CoeficienteRequest();
    coeficienteRequest.lstFabricantes = new Array();
    coeficienteRequest.dataRefCoeficiente = dataReferencia;

    this.novoOrcamentoService.lstProdutosSelecionados.forEach(x => { coeficienteRequest.lstFabricantes.push(x.fabricante) });
    this.produtoService.buscarCoeficientes(coeficienteRequest).toPromise().then((r) => {
      if (r != null) {

        if (!this.editando) {
          this.novoOrcamentoService.recalcularProdutosComCoeficiente(this.formaPagto.buscarQtdeParcelas(), r);
          if (this.novoOrcamentoService.qtdeParcelas) {
            this.formaPagto.setarValorParcela(this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas);
            this.formaPagto.calcularValorAvista();
            this.novoOrcamentoService.coeficientes = r;
          }
        }
        if (this.editando) {
          this.novoOrcamentoService.coeficientes = r;
        }
      }
    }).catch((e) => { this.mensagemService.showErrorViaToast(["Falha ao buscar lista de coeficientes!"]) });
  }

  digitouQte(item: ProdutoOrcamentoDto): void {
    if (item.qtde <= 0) item.qtde = 1;

    item.totalItem = item.precoVenda * item.qtde;

    this.formaPagto.setarValorParcela(this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas);
    this.formaPagto.calcularValorAvista();
    if (this.novoOrcamentoService.calcularComissaoAuto)
      this.novoOrcamentoService.calcularPercentualComissao();
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
    if (Number.parseFloat(v) > this.novoOrcamentoService.percMaxComissaoEDescontoUtilizar) {
      this.mensagemService.showErrorViaToast([`O desconto no item ${item.fabricante}/${item.produto} excede o máximo permitido!`]);
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

  formataDescontoGeral(e: Event) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');

    if (v == "") {
      this.novoOrcamentoService.descontoGeral = 0;
    }

    if (!isNaN(v)) {
      v = (v / 100).toFixed(2) + '';
      this.novoOrcamentoService.descontoGeral = Number.parseFloat(v);
    }
  }

  aplicarDescontoGeral(e: Event) {

    if (!this.novoOrcamentoService.verificarDescontoGeral()) return;
    this.novoOrcamentoService.lstProdutosSelecionados.forEach(x => {
      let valor = ((e.target) as HTMLInputElement).value;
      let v: any = valor.replace(/,/g, '');
      v = (v / 100).toFixed(2) + '';
      x.descDado = parseFloat(v);

      this.digitouDesc(e, x);
    });
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

    if (item.descDado > this.novoOrcamentoService.percMaxComissaoEDescontoUtilizar) {
      this.mensagemService.showErrorViaToast([`O desconto no item ${item.fabricante}/${item.produto} excede o máximo permitido!`]);
      return;
    }

    if (item.precoLista == item.precoVenda) {
      item.alterouPrecoVenda = false;
    } else {
      item.alterouPrecoVenda = true;
    }

    this.digitouQte(item);
  }

  confirmaProdutoComposto(item: ProdutoOrcamentoDto): boolean {
    let pc = this.produtoComboDto?.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
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
        let produto = this.produtoComboDto?.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
        // produto.filhos.forEach(i => {
        //   if (i.alertas) {
        //     retorno = true;
        //     this.mensagemAlerta = i.alertas;
        //   }
        // });
      }
      if (!this.confirmaProdutoComposto(item)) {
        let produto = this.produtoComboDto?.produtosSimples.filter(f => f.produto == item.produto)[0];
        if (produto != undefined && produto.alertas) {
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
      let produto = this.produtoComboDto?.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
      let excede: boolean = false;
      produto.filhos.forEach(i => {
        let produtoSimples = this.produtoComboDto?.produtosSimples.filter(f => f.produto == item.produto)[0];
        if (produtoSimples != undefined && produtoSimples.estoque < (item.qtde * i.qtde)) {
          excede = true;
          return;
        }
      });
      return excede;
    }
    if (!this.confirmaProdutoComposto(item)) {
      let produto = this.produtoComboDto?.produtosSimples.filter(f => f.produto == item.produto)[0];
      if (produto != undefined && produto.estoque < item.qtde) {
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
      let produto = this.produtoComboDto?.produtosCompostos.filter(f => f.paiProduto == item.produto)[0];
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
      let produto = this.produtoComboDto?.produtosSimples.filter(f => f.produto == item.produto)[0];
      if (produto != undefined && produto.qtdeMaxVenda < item.qtde) {
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

  desabilitarEnvio: boolean = false;
  salvarOrcamento() {

    if (this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length == 0) {
      this.alertaService.mostrarMensagem("É necessário adicionar ao menos uma opção!");
      return;
    }

    this.desabilitarEnvio = true;
    this.orcamentosService.enviarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto).toPromise().then((r) => {
      if (r.erro != null) {
        this.alertaService.mostrarMensagem(r.erro);
        this.desabilitarEnvio = false;
        return;
      }

      this.sweetalertService.sucesso("Orçamento salvo!");
      this.novoOrcamentoService.criarNovo();
      this.novoOrcamentoService.descontoGeral = 0;
      this.router.navigate(["orcamentos/listar/orcamentos"]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.desabilitarEnvio = false;
    });
  }

  voltar() {
    this.novoOrcamentoService.lstProdutosSelecionados = new Array();
    this.router.navigate(["orcamentos/cadastrar-cliente", this.param]);
  }

  liberarEdicaoComissao() {
    if (this.novoOrcamentoService.editarComissao) {
      this.novoOrcamentoService.editarComissao = false;
      return;
    }

    this.novoOrcamentoService.editarComissao = true;
  }

  antigoPercRT: number;
  formataComissao(e: Event) {
    
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '').replace(/\./g, "");
    v = Number.parseFloat((v * 0.1) + '');
    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = v;
  }

  editarComissao(e: Event) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '').replace(/\./g, "");
    v = Number.parseFloat((v * 0.1) + '');

    if (!this.novoOrcamentoService.validarComissao(v)) {
      v = this.antigoPercRT;
      ((e.target) as HTMLInputElement).value = this.moedaUtils.formatarPorcentagemUmaCasaReturnZero(this.antigoPercRT);
      this.mensagemService.showErrorViaToast(["A comissão informada excede o máximo permitido!"]);
    }

    this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = v;
    this.novoOrcamentoService.editarComissao = false;
  }
}
