import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { eSimultaneidade } from 'src/app/utilities/enums/eSimultaneidade';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { SelectEvapDialogComponent } from './select-evap-dialog/select-evap-dialog.component';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import jsPDF from 'jspdf';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { Observable } from 'rxjs';
import { ProdutoCalculadoraVrfRequestViewModel } from 'src/app/dto/produtos-catalogo/ProdutoCalculadoraVrfRequestViewModel';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../orcamentos/novo-orcamento/novo-orcamento.service';

@Component({
  selector: 'app-calculadora-vrf',
  templateUrl: './calculadora-vrf.component.html',
  styleUrls: ['./calculadora-vrf.component.scss']
})
export class CalculadoraVrfComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private readonly produtoService: ProdutoCatalogoService,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    public dialogService: DialogService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentoService: OrcamentosService,
    private readonly novoOrcamentoService: NovoOrcamentoService
  ) { }

  form: FormGroup;
  form2: FormGroup;
  fabricantes: ProdutoCatalogoFabricante[];
  lstSimultaneidades: SelectItem[] = [];
  lstFabricantes: SelectItem[] = [];
  lstQtdeCondensadoras: SelectItem[] = [];
  lstOpcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstVoltagens: SelectItem[] = [];
  lstDescargas: SelectItem[] = [];
  carregando: boolean;
  produtosPropriedadesAtivos: ProdutoCatalogoItemProdutosAtivosDados[];
  evaporadoras = new Array<ProdutoTabela>();
  condensadoras = new Array<ProdutoTabela>();
  produtosDados: ProdutoCatalogoItemProdutosAtivosDados[];
  produtosVrf: ProdutoCatalogoItemProdutosAtivosDados[];
  evaporadorasSelecionadas = new Array<ProdutoTabela>();
  condensadorasSelecionadas = new Array<ProdutoTabela>();
  condensadorasFiltradas: ProdutoTabela[] = [];
  combinacaoCom3aparelhos: ProdutoTabela[];
  simultaneidadeCalculada3aparelhos: number;
  combinacaoCom2aparelhos: ProdutoTabela[];
  simultaneidadeCalculada2aparelhos: number;
  combinacaoCom1aparelhos: ProdutoTabela[];
  simultaneidadeCalculada1aparelho: number;
  totalKcalEvaporadoras: number;
  simultaneidade: string;
  qtdeCondensadora: number;
  voltagem: number;
  descarga: number;
  fabricante: string;
  fabricanteSelecionado: string;
  stringUtils = StringUtils;
  moedaUtils = new MoedaUtils();
  mensagemErro: string = "*Campo obrigatório.";
  nomeCliente: string = '';
  nomeObra: string = '';
  telefone: string = '';
  email: string = '';
  observacao: string = '';
  instalador: string = '';
  telInstalador: string = '';
  mascaraTelefone: string;
  calculado: boolean = false;
  desabilita: boolean = false;
  lstCiclos: SelectItem[] = [];
  ciclo: string;
  opcao1: boolean = false;
  opcao2: boolean = false;
  opcao3: boolean = false;
  dataUtils: DataUtils = new DataUtils();
  logo: string;
  dataAtual: string;
  textoRodape: string;
  imprimindo: boolean = false;
  constantes: Constantes = new Constantes();
  clicouEvaporadora: boolean;


  imagem: any;

  ngOnInit(): void {
    this.clicouEvaporadora = false;
    this.carregando = true;
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.criarForm2();
    this.buscarQtdeMaxCondensadoras();
    this.dataAtual = new Date().toLocaleString("pt-br");

    let promise: any = [this.buscarProdutos(), this.buscarOpcoes(), this.buscarTextoRodapePDF(),
    this.buscarRangeSimultaneidade(), this.buscarParametroLogoImpressao(this.autenticacaoService._lojaLogado)];
    Promise.all(promise).then((r: any) => {
      this.setarProdutos(r[0]);
      this.setarOpcoes(r[1]);
      this.setarTextoRodapePDF(r[2]);
      this.setarRangeSimultaneidade(r[3]);
      this.setarImagemLogoImpressao(r[4])
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
    });
  }

  criarForm() {
    this.form = this.fb.group({
      fabricanteSelecionado: ['', [Validators.required]]
    });
  }

  criarForm2() {
    this.form2 = this.fb.group({
      voltagem: ['', [Validators.required]],
      descarga: ['', [Validators.required]],
      simultaneidade: ['', [Validators.required]],
      qtdeCondensadora: ['', [Validators.required]],
      ciclo: ['', [Validators.required]]
    });
  }

  buscarQtdeMaxCondensadoras() {
    this.lstQtdeCondensadoras.push({ title: "1", value: 1, label: "1" },
      { title: "2", value: 2, label: "2" },
      { title: "3", value: 3, label: "3" });
  }

  buscarProdutos(): Promise<ProdutoCatalogoItemProdutosAtivosDados[]> {
    let request: ProdutoCalculadoraVrfRequestViewModel = new ProdutoCalculadoraVrfRequestViewModel();
    request.propriedadeOculta = null;
    request.propriedadeOcultaItem = null;
    return this.produtoService.listarProdutosPropriedadesAtivos(request).toPromise()
  }

  buscarOpcoes(): Promise<ProdutoCatalogoPropriedadeOpcao[]> {
    return this.produtoService.buscarOpcoes().toPromise();
  }

  buscarLogoPDF(): Promise<any> {
    let IdCfgParametro = this.constantes.ModuloOrcamentoCotacao_CalculadoraVrf_LogoPdf;
    return this.orcamentoService.buscarParametros(IdCfgParametro, this.autenticacaoService._lojaLogado, null).toPromise();
  }

  buscarTextoRodapePDF(): Promise<any> {
    let IdCfgParametro = this.constantes.ModuloOrcamentoCotacao_CalculadoraVrf_TextoDisclaimer;
    return this.orcamentoService.buscarParametros(IdCfgParametro, this.autenticacaoService._lojaLogado, null).toPromise();
  }

  buscarRangeSimultaneidade(): Promise<any> {
    let IdCfgParametro = this.constantes.ModuloOrcamentoCotacao_CalculadoraVrf_FaixaSimultaneidade;
    return this.orcamentoService.buscarParametros(IdCfgParametro, this.autenticacaoService._lojaLogado, null).toPromise();
  }

  buscarParametroLogoImpressao(loja: string): Promise<any> {
    let IdCfgParametro = this.constantes.ModuloOrcamentoCotacao_CalculadoraVrf_LogoPdf;
    return this.orcamentoService.buscarParametros(IdCfgParametro, loja, null).toPromise();
  }

  setarProdutos(r: ProdutoCatalogoItemProdutosAtivosDados[]) {
    if (r != null) {
      this.produtosDados = r;
      this.filtrarProdutosVrf();
    }
  }

  setarOpcoes(r: ProdutoCatalogoPropriedadeOpcao[]) {
    if (r != null) {
      this.lstOpcoes = r;
      this.buscarVoltagens();
      this.buscarDescargas();
      this.buscarCiclos();
    }
  }

  setarLogoPDF(r: any) {
    if (r != null) {
      this.logo = "assets/layout/images/" + r[0]['Valor'];
    }
  }

  setarTextoRodapePDF(r: any) {
    if (r != null) {
      this.textoRodape = r[0]['Valor'];
    }
  }

  setarRangeSimultaneidade(r: any) {
    if (r != null) {
      let splitRange = r[0].Valor.split("|");
      splitRange.forEach(x => {
        let splitItem = x.split("~");
        let min = splitItem[0];
        let max = splitItem[1];
        this.lstSimultaneidades.push({ title: `${min} a ${max}`, value: `${min}|${max}`, label: `${min} a ${max}` });
      });
    }
  }

  setarImagemLogoImpressao(r: any) {
    if (r != null) {
      this.imagem = "assets/layout/images/" + r[0]['Valor'];
    }
  }

  filtrarProdutosVrf() {
    this.produtosVrf = this.produtosDados.filter(x => x.idPropriedade == 1 && x.idValorPropriedadeOpcao == 12);

    this.buscarEvaporadoras();
    this.buscarFabricantes();
    this.buscarCondensadoras();
    this.carregando = false;
  }

  buscarCondensadoras() {
    this.produtosVrf.forEach(x => {
      let cond = this.produtosDados.filter(e => e.produto == x.produto && e.idPropriedade == 2 && e.idValorPropriedadeOpcao == 21);

      if (cond.length > 0) {
        let lista = this.produtosDados.filter(p => p.produto == x.produto);

        let produtoTabela = new ProdutoTabela();
        produtoTabela.id = lista[0].id;
        produtoTabela.fabricante = lista[0].fabricante;
        produtoTabela.linhaBusca = `|${this.constantes.fFabr}${produtoTabela.fabricante}|`;
        produtoTabela.produto = lista[0].produto;
        produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fProd}${produtoTabela.produto}|`;
        produtoTabela.descricao = lista[0].descricao;
        produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fDesc}${produtoTabela.descricao}|`;
        produtoTabela.qtde = 0;

        let voltagem: boolean = false;
        let descarga: boolean = false;
        let kw: boolean = false;
        let ciclo: boolean = false;

        lista.forEach(l => {

          produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fProp}${(l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao)}|`;

          if (l.idPropriedade == 4 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            voltagem = true;
            produtoTabela.voltagem = l.valorPropriedade;
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fVolt}${l.idValorPropriedadeOpcao}|`;
          }

          if (l.idPropriedade == 3) {
            descarga = true;
            produtoTabela.descarga = l.valorPropriedade;
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fDescar}${l.idValorPropriedadeOpcao}|`;
          }

          if (l.idPropriedade == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kw = l.valorPropriedade.replace(",", ".");
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fKw}${produtoTabela.kw}|`;
          }

          if (l.idPropriedade == 10 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kcal = l.valorPropriedade;
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fKcal}${produtoTabela.kcal}|`;
          }

          if (l.idPropriedade == 11 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.hp = l.valorPropriedade;
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fHp}${produtoTabela.hp}|`;
          }

          if (l.idPropriedade == 6 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            ciclo = true;
            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fCiclo}${l.idValorPropriedadeOpcao}|`;
          }
        });

        if (voltagem && descarga && kw && ciclo) {
          this.condensadoras.push(produtoTabela);
        }
      }
    });
  }

  buscarEvaporadoras() {

    this.produtosVrf.forEach(x => {
      let evap = this.produtosDados.filter(e => e.produto == x.produto && e.idPropriedade == 2 && e.idValorPropriedadeOpcao == 22);

      if (evap.length > 0) {
        let lista = this.produtosDados.filter(p => p.produto == x.produto);

        let temKw = lista.filter(t => t.idPropriedade == 7 && (t.valorPropriedade != null && t.valorPropriedade != ''));

        if (temKw.length > 0) {
          let produtoTabela = new ProdutoTabela();
          produtoTabela.id = lista[0].id;
          produtoTabela.fabricante = lista[0].fabricante;
          produtoTabela.linhaBusca = `|${this.constantes.fFabr}${produtoTabela.fabricante}|`;
          produtoTabela.produto = lista[0].produto;
          produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fProd}${produtoTabela.produto}|`;
          produtoTabela.descricao = lista[0].descricao;
          produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fDesc}${produtoTabela.descricao}|`;

          lista.forEach(l => {
            if (l.idPropriedade == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
              l.valorPropriedade = l.valorPropriedade.replace(",", ".");
              produtoTabela.kw = l.valorPropriedade;
            }
            if (l.idPropriedade == 5) {
              produtoTabela.btu = l.valorPropriedade;
            }
            if (l.idPropriedade == 10) {
              produtoTabela.kcal = l.valorPropriedade;
            }

            produtoTabela.linhaBusca = `${produtoTabela.linhaBusca}|${this.constantes.fProp}${(l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao)}|`;
          });
          this.evaporadoras.push(produtoTabela);
        }
      }
    });
  }

  buscarFabricantes() {
    this.produtoService.buscarFabricantes().toPromise().then((r) => {
      if (r != null) {

        this.filtrarFabricantes(r);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  private distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  filtrarFabricantes(fabricante: ProdutoCatalogoFabricante[]) {
    let map = this.evaporadoras.map(x => x.fabricante);
    let filtrado: any[] = map.filter(this.distinct);

    filtrado.forEach(f => {
      let filtro = fabricante.filter(x => x.Fabricante == f);
      if (filtro.length > 0) {
        this.lstFabricantes.push({ title: filtro[0].Nome, value: filtro[0].Fabricante, label: filtro[0].Nome });
      }
    });
  }

  buscarVoltagens() {
    let voltagens = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 4);

    voltagens.forEach(x => {
      if (x.valor != "127") {
        let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
        this.lstVoltagens.push(opcao);
      }
    });
  }

  buscarDescargas() {
    let descargas = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 3);

    descargas.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstDescargas.push(opcao);
    });
  }

  filtrarEvaporadoras(): ProdutoTabela[] {
    let fabricante = this.form.controls.fabricanteSelecionado.value;
    let evaps = this.evaporadoras.filter(x => x.fabricante == fabricante).slice()
    return evaps;
  }

  adicionarEvaporadoras() {

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }

    if (this.clicouEvaporadora) return;

    this.clicouEvaporadora = true;
    let largura: string = this.novoOrcamentoService.onResize();
    const ref = this.dialogService.open(SelectEvapDialogComponent,
      {
        width: largura,
        styleClass: 'dynamicDialog',
        data: { evaps: this.filtrarEvaporadoras(), opcoes: this.lstOpcoes },
        closeOnEscape: false,
        closable: false,
        showHeader: false,
        contentStyle: (resultado: ProdutoTabela[]) => {
          if (resultado && resultado.length > 0) {
            this.addEvapsSelecionadas(resultado);
          }
        }
      });

    ref.onClose.subscribe((r) => {
      this.clicouEvaporadora = false;
    });
  }

  addEvapsSelecionadas(produtos: Array<ProdutoTabela>) {
    produtos.forEach(p => {
      this.arrumarProdutosRepetidos(p);
      this.digitouQte(p);
    });
  }

  removerItem(index: number) {
    let produto = this.evaporadorasSelecionadas.splice(index, 1)[0];
    this.digitouQte(produto);
  }

  filtrarQtdeCondensadora() {
    if (this.descarga == 52) {
      this.qtdeCondensadora = 1;
      this.desabilita = true;
      return;
    }

    this.desabilita = false;
    this.qtdeCondensadora = null;
  }

  digitouQte(produto: ProdutoTabela) {
    this.limparCombinacoesCondensadoras();
    if (produto.qtde == undefined || produto.qtde <= 0) produto.qtde = 1;

    this.totalKcalEvaporadoras = this.evaporadorasSelecionadas
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);

    if (this.calculado) {
      this.calcularCondensadoras();
    }
  }

  arrumarProdutosRepetidos(produto: ProdutoTabela) {
    let repetidos = this.evaporadorasSelecionadas.filter(x => x.produto == produto.produto).slice();

    if (repetidos.length >= 1) {
      this.evaporadorasSelecionadas.forEach(x => {
        if (x.produto == produto.produto) {
          x.qtde = x.qtde == undefined ? 1 : Number.parseInt(x.qtde.toString()) + Number.parseInt(produto.qtde.toString());
          this.digitouQte(x);
          return;
        }
      });
    }
    else {
      let produto2 = new ProdutoTabela();
      produto2.fabricante = produto.fabricante;
      produto2.produto = produto.produto;
      produto2.descricao = produto.descricao;
      produto2.id = produto.id;
      produto2.kcal = produto.kcal;
      produto2.kw = produto.kw;
      produto2.btu = produto.btu;
      produto2.qtde = produto.qtde;
      produto2.linhaBusca = produto.linhaBusca;
      produto2.linhaProduto = produto.linhaProduto;
      this.evaporadorasSelecionadas.push(produto2);
    }
  }

  buscarCiclos() {
    let ciclos = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 6)

    ciclos.forEach(x => {
      if (!!x.valor) {
        let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
        this.lstCiclos.push(opcao);
      }
    });
  }

  filtrarCondensadoras() {

    this.condensadorasFiltradas = new Array();
    this.condensadorasFiltradas = this.condensadoras;
    if (this.evaporadorasSelecionadas.findIndex(x => x.linhaBusca.includes("302")) > -1) {
      this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes("302"));
    }

    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.fabricante == this.fabricanteSelecionado);
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(`|${this.constantes.fCiclo}${this.ciclo}|`));
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(`|${this.constantes.fVolt}${this.voltagem.toString()}|`));
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(`|${this.constantes.fDescar}${this.descarga.toString()}|`));
  }

  limparFiltros() {
    if (this.evaporadorasSelecionadas.length > 0) {
      this.sweetalertService.dialogo("", "Ao mudar o fabricante, as condensadoras calculadas e as evaporadoras selecionadas serão excluidas! Tem certeza que deseja alterar o fabricante selecionado?").subscribe(result => {
        if (!result) {
          this.fabricanteSelecionado = this.fabricante;
          return;
        }
        this.limparEvaporadorasSelecionadas();
        this.limparCombinacoesCondensadoras();
        this.limparFiltrosCondensadoras();
        this.fabricante = this.fabricanteSelecionado;
      });
      return;
    }

    this.fabricante = this.fabricanteSelecionado;
  }

  limparEvaporadorasSelecionadas() {
    this.evaporadorasSelecionadas = new Array<ProdutoTabela>();
  }

  limparCombinacoesCondensadoras() {
    this.combinacaoCom1aparelhos = new Array<ProdutoTabela>();
    this.simultaneidadeCalculada1aparelho = 0;
    this.combinacaoCom2aparelhos = new Array<ProdutoTabela>();
    this.simultaneidadeCalculada2aparelhos = 0;
    this.combinacaoCom3aparelhos = new Array<ProdutoTabela>();
    this.simultaneidadeCalculada3aparelhos = 0;

    this.calculado = false;
    this.opcao1 = false;
    this.opcao2 = false;
    this.opcao3 = false;
  }

  limparFiltrosCondensadoras() {
    this.criarForm2();
    this.opcao1 = false;
    this.opcao2 = false;
    this.opcao3 = false;
  }

  podeCalcular() {
    if (!this.validacaoFormularioService.validaForm(this.form2)) {
      return false;
    }

    if (this.evaporadorasSelecionadas.length <= 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione evaporadoras antes de calcular condensadoras!");
      return false;
    }

    return true;
  }

  calcularCondensadoras() {
    this.limparCombinacoesCondensadoras();

    this.carregando = true;
    setTimeout(() => {
      if (!this.podeCalcular()) {
        this.carregando = false;
        return;
      }

      let somaCapacidadeEvaporadoras = this.evaporadorasSelecionadas
        .reduce((sum, current) => sum + (Number.parseFloat(current.kw) * current.qtde), 0);
      somaCapacidadeEvaporadoras = Math.round(somaCapacidadeEvaporadoras);

      let simultaneidadeMin = this.simultaneidade.split("|", 2)[0];
      let simultaneidadeMinFloat = Number.parseFloat(simultaneidadeMin);

      let simultaneidadeMax = this.simultaneidade.split("|", 2)[1];
      let simultaneidadeMaxFloat = Number.parseFloat(simultaneidadeMax);

      this.filtrarCondensadoras();
      let capacidadeMinima = Math.round(somaCapacidadeEvaporadoras / (simultaneidadeMaxFloat / 100));

      this.combinacaoCom1aparelhos = this.buscarMelhorCombinacao1Condensadora(capacidadeMinima, this.condensadorasFiltradas,
        simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);

      if (this.qtdeCondensadora > 1) {
        this.combinacaoCom2aparelhos = this.buscarMelhorCombinacao2Condensadoras(capacidadeMinima, this.condensadorasFiltradas,
          simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);

        if (this.qtdeCondensadora == 3)
          this.combinacaoCom3aparelhos = this.buscarMelhorCombinacao3Condensadoras(capacidadeMinima, this.condensadorasFiltradas,
            simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);
      }

      //caso o cálculo seja para 1 condensadora, já deve setar a selação para incluir no PDF
      if (this.qtdeCondensadora == 1) this.opcao1 = true;

      this.carregando = false;
      this.calculado = true;
    }, 100);
  }

  buscarMelhorCombinacao1Condensadora(capacidadeMinima: number, condensadoras: ProdutoTabela[], simultaneidadeMaxFloat: number,
    simultaneidadeMinFloat: number, capacidadeTotalEvaps: number) {
    let condensadora1 = this.calcularCombinacaoCom1aparelho(capacidadeMinima, this.condensadorasFiltradas);

    let candidatas = [];
    condensadora1.forEach(x => {
      let prodUnificado = this.unificarEquipamentosIguais(x).slice();
      let simultaneidade = this.calcularSimultaneidade(prodUnificado, capacidadeTotalEvaps);
      if (Math.round(simultaneidade) <= simultaneidadeMaxFloat && Math.round(simultaneidade) >= simultaneidadeMinFloat)
        candidatas.push([prodUnificado, simultaneidade]);
    });

    if (candidatas.length == 0) return new Array();

    let maiorSimultaneidadeOpcoes = this.pegarMaiorSimultaneidade(candidatas);

    let maior = this.selecionarMaioresCondensadoras(candidatas, maiorSimultaneidadeOpcoes);

    this.simultaneidadeCalculada1aparelho = maior[0][1];
    return this.criarRetornoCondensadoras(maior[0][0]);
  }

  buscarMelhorCombinacao2Condensadoras(capacidadeMinima: number, condensadoras: ProdutoTabela[], simultaneidadeMaxFloat: number,
    simultaneidadeMinFloat: number, capacidadeTotalEvaps: number) {

    let condensadoras2 = this.calcularCombinacaoCom2aparelhos(capacidadeMinima, condensadoras);

    let candidatas = [];
    condensadoras2.forEach(x => {
      let prodUnificado = this.unificarEquipamentosIguais(x).slice();
      let simultaneidade = this.calcularSimultaneidade(prodUnificado, capacidadeTotalEvaps);
      if (Math.round(simultaneidade) <= simultaneidadeMaxFloat && Math.round(simultaneidade) >= simultaneidadeMinFloat) {
        candidatas.push([prodUnificado, simultaneidade]);
      }
    });

    if (candidatas.length == 0) return new Array();

    let maiorSimultaneidadeOpcoes = this.pegarMaiorSimultaneidade(candidatas);

    let maiores = this.selecionarMaioresCondensadoras(candidatas, maiorSimultaneidadeOpcoes);

    let melhor = this.selecionarMelhorOpcao2Condensadoras(maiores);

    this.simultaneidadeCalculada2aparelhos = melhor[1];
    return this.criarRetornoCondensadoras(melhor[0]);
  }

  buscarMelhorCombinacao3Condensadoras(capacidadeMinima: number, condensadoras: ProdutoTabela[], simultaneidadeMaxFloat: number,
    simultaneidadeMinFloat: number, capacidadeTotalEvaps: number) {

    let condensadoras3 = this.calcularCombinacaoCom3aparelhos(capacidadeMinima, condensadoras);

    let candidatas = [];
    condensadoras3.forEach(x => {
      let prodUnificado = this.unificarEquipamentosIguais(x).slice();
      let simultaneidade = this.calcularSimultaneidade(prodUnificado, capacidadeTotalEvaps);
      if (Math.round(simultaneidade) <= simultaneidadeMaxFloat && Math.round(simultaneidade) >= simultaneidadeMinFloat) {
        candidatas.push([prodUnificado, simultaneidade]);
      }
    });

    if (candidatas.length == 0) return new Array();
    let maiorSimultaneidadeOpcoes = this.pegarMaiorSimultaneidade(candidatas);
    let maiores = this.selecionarMaioresCondensadoras(candidatas, maiorSimultaneidadeOpcoes);
    let melhor = this.selecionarMelhorOpcao3Condensadoras(maiores);
    this.simultaneidadeCalculada3aparelhos = maiorSimultaneidadeOpcoes;
    return this.criarRetornoCondensadoras(melhor[0]);

  }

  pegarMaiorSimultaneidade(candidatas: any) {
    let maior = 0;
    candidatas.forEach(prod => {
      let simultaneidadeAtual = prod[1];
      if (simultaneidadeAtual > maior) {
        maior = simultaneidadeAtual;
      }
    });

    return maior;
  }

  selecionarMaioresCondensadoras(candidatas: any, maior: number) {
    let maiores = [];
    candidatas.forEach(x => {
      if (x[1] == maior) {
        maiores.push(x);
      }
    });

    return maiores;
  }

  selecionarMelhorOpcao2Condensadoras(maiores: any[]) {
    let melhorOpcao = [];
    let variacao = 0;
    maiores.forEach(x => {
      let variacaoAtual = x[0].length > 1 ? Math.abs(Number.parseFloat(x[0][0].kw) - Number.parseFloat(x[0][1].kw)) : 0;
      if (variacao == 0) {
        variacao = variacaoAtual;
        melhorOpcao = x;
      }
      else {
        if (variacaoAtual <= variacao) {
          melhorOpcao = x;
        }
      }
    });

    return melhorOpcao;
  }

  selecionarMelhorOpcao3Condensadoras(maiores: any[]) {
    let melhorOpcao = [];
    let variacao = 0;
    maiores.forEach(x => {
      let variacaoAtual = 0;
      if (x[0].length == 1) {
        variacaoAtual = 0;
      }
      if (x[0].length == 2) {
        variacaoAtual = Math.abs(Number.parseFloat(x[0][0].kw) - Number.parseFloat(x[0][1].kw));
      }
      if (x[0].length == 3) {
        variacaoAtual = Math.abs(Number.parseFloat(x[0][0].kw) - Number.parseFloat(x[0][1].kw)) +
          Math.abs(Number.parseFloat(x[0][0].kw) - Number.parseFloat(x[0][2].kw)) +
          Math.abs(Number.parseFloat(x[0][1].kw) - Number.parseFloat(x[0][2].kw));
      }

      if (variacao == 0) {
        variacao = variacaoAtual;
        melhorOpcao = x;
      }
      else {
        if (variacaoAtual <= variacao) {
          melhorOpcao = x;
        }
      }
    });

    return melhorOpcao;
  }

  criarRetornoCondensadoras(condensadoras: any[]): ProdutoTabela[] {
    let retorno: ProdutoTabela[] = new Array();

    for (let i = 0; i < condensadoras.length; i++) {
      this.condensadorasFiltradas.forEach(y => {
        if (y.produto == condensadoras[i].produto) {
          let produto2 = new ProdutoTabela();
          produto2.fabricante = y.fabricante;
          produto2.produto = y.produto;
          produto2.descricao = y.descricao;
          produto2.id = y.id;
          produto2.kcal = y.kcal;
          produto2.qtde = condensadoras[i].qtde;
          produto2.hp = y.hp;
          retorno.push(produto2);
        }
      });
    }

    return retorno;
  }

  calcularSimultaneidade(arrayProdutosEscolhidos, somaCapacidadeEvaporadoras) {
    let capacidadeProdutosEscolhidos = 0;
    let simultaneidade = 0;
    if (arrayProdutosEscolhidos.length > 0) {
      for (let i1 = 0; i1 < arrayProdutosEscolhidos.length; i1++) {
        capacidadeProdutosEscolhidos += (arrayProdutosEscolhidos[i1].kw * arrayProdutosEscolhidos[i1].qtde);
      }
      simultaneidade = somaCapacidadeEvaporadoras / capacidadeProdutosEscolhidos;
    }
    return Math.round(simultaneidade * 10000) / 100;
  }

  unificarEquipamentosIguais(produtosEscolhidos) {
    let retorno = [];
    produtosEscolhidos.forEach(x => {
      let produto = new ProdutoTabela();
      produto.id = x.id;
      produto.linhaBusca = x.linhaBusca;
      produto.produto = x.produto;
      produto.fabricante = x.fabricante;
      produto.descricao = x.descricao;
      produto.linhaProduto = x.linhaProduto;
      produto.tipoUnidade = x.tipoUnidade;
      produto.voltagem = x.voltagem;
      produto.capacidade = x.capacidade;
      produto.kcal = x.kcal;
      produto.kw = x.kw;
      produto.hp = x.hp;
      produto.descarga = x.descarga;
      produto.btu = x.btu;
      produto.qtde = x.qtde;
      let produtoJaExiste = retorno.filter(p => p.id == x.id);
      if (produtoJaExiste.length > 0) {
        produtoJaExiste[0].qtde += 1;
      }
      else {
        produto.qtde = 1;
        retorno.push(produto);
      }
    });

    return retorno;
  }

  calcularCombinacaoCom1aparelho(capacidadeMinima, arrayCapacidades: ProdutoTabela[]) {
    let candidatas = [];
    arrayCapacidades.forEach(x => {
      let estaCapcidade = Number.parseFloat(x.kw);
      if (estaCapcidade >= capacidadeMinima) {
        candidatas.push([x]);
      }
    });

    return candidatas;
  }

  calcularCombinacaoCom2aparelhos(capacidadeMinima, arrayCapacidades: ProdutoTabela[]) {
    let combinacaoes = [];
    for (let i1 = 0; i1 < arrayCapacidades.length; i1++) {
      for (let i2 = 0; i2 < arrayCapacidades.length; i2++) {
        let estaCapcidade = Number.parseFloat(arrayCapacidades[i1].kw) + Number.parseFloat(arrayCapacidades[i2].kw);
        if (estaCapcidade >= capacidadeMinima) {
          if (Number.parseInt(arrayCapacidades[i1].id) < Number.parseInt(arrayCapacidades[i2].id))
            combinacaoes.push([arrayCapacidades[i1], arrayCapacidades[i2]]);
          else combinacaoes.push([arrayCapacidades[i2], arrayCapacidades[i1]]);
        }
      }
    }

    return this.removerDuplicados(combinacaoes);
  }

  calcularCombinacaoCom3aparelhos(capacidadeMinima, arrayCapacidades: ProdutoTabela[]) {
    let combinacaoes = [];

    for (let i1 = 0; i1 < arrayCapacidades.length; i1++) {
      for (let i2 = 0; i2 < arrayCapacidades.length; i2++) {
        for (let i3 = 0; i3 < arrayCapacidades.length; i3++) {
          let estaCapcidade = Number.parseFloat(arrayCapacidades[i1].kw) + Number.parseFloat(arrayCapacidades[i2].kw) + + Number.parseFloat(arrayCapacidades[i3].kw);
          if (estaCapcidade >= capacidadeMinima) {
            let item = [arrayCapacidades[i1], arrayCapacidades[i2], arrayCapacidades[i3]];
            item.sort((a, b) => {
              if (a.id < b.id) return -1;
              if (b.id > a.id) return 1;
              return 0;
            });
            combinacaoes.push(item);
          }
        }
      }
    }


    return this.removerDuplicados(combinacaoes);
  }

  removerDuplicados(combinacaoes) {
    let retorno = [];
    combinacaoes.forEach((item) => {
      var duplicated = retorno.findIndex(redItem => {
        return JSON.stringify(item) == JSON.stringify(redItem);
      }) > -1;

      if (!duplicated) {
        retorno.push(item);
      }
    });

    return retorno;
  }

  voltar() {
    this.imprimindo = false;
  }

  TAB_SIZE = 10;
  NORMAL_FONT_SIZE = 10;
  TITLE_FONT_SIZE = 14;
  SUBTITLE_FONT_SIZE = 12;
  SMALL_FONT_SIZE = 8;
  FOOTER_MARGIN = this.SMALL_FONT_SIZE * 3;

  buscarImagemPDF() {
    if (!this.opcao1 && !this.opcao2 && !this.opcao3) {
      this.mensagemService.showWarnViaToast("Selecione ao menos 1 opção!");
      return;
    }
    // this.getImageSize2(this.imagem);
    let img = new Image();
    img.src = this.imagem;

    this.buscarTamanhoImagem(this.imagem).then(({ source, height, width }) => {
      this.gerarPDF({ source, height, width });
    });
  }

  // Função para pegar tamanho da imagem
  buscarTamanhoImagem(source: string): any {
    return new Promise((resolve) => {

      const image = new Image();
      image.onload = () => {
        const height = image.height * 0.75;
        const width = image.width * 0.75;

        resolve({ source, height, width });
      };
      image.src = source;
    });
  }

  gerarPDF(image) {
    const data = new Date();

    const doc = this.crriarPDF();

    let currentPositionY = this.addPaginaPDF(doc, image);

    currentPositionY = this.addInformacoes(doc, currentPositionY);
    doc.save(
      `calculo_vrf_${this.buscarDataNomePDF(data)}.pdf`
    );
  }

  crriarPDF(): jsPDF {
    const doc = new jsPDF({
      orientation: "portrait",
      format: "a4",
      unit: "px",
    });

    doc.deletePage(1);
    return doc;
  }

  addPaginaPDF(doc: jsPDF, image) {
    doc.addPage();

    // Adicionar imagem na primeira pagina
    if (doc.getNumberOfPages() === 1 && image?.source) {
      doc.addImage(
        image.source,
        "PNG",
        doc.internal.pageSize.width - image.width - (this.TAB_SIZE + this.TAB_SIZE),
        this.TAB_SIZE,
        image.width,
        image.height
      );
    }

    // Adicionar moldura do relatorio
    doc
      .setFillColor("#000").setDrawColor("#000")
      .rect(
        this.TAB_SIZE,
        this.TAB_SIZE,
        doc.internal.pageSize.width - 2 * this.TAB_SIZE,
        doc.internal.pageSize.height - 2 * this.TAB_SIZE,
        "S"
      );

    return 3 * this.TAB_SIZE;
  }

  addInformacoes(doc: jsPDF, currentPositionY: number) {
    currentPositionY = this.addTitulo(doc, currentPositionY, "Dimensionamento sistema VRF", true);

    let retornoPositionY = this.addDadosCliente(doc, currentPositionY);

    if (retornoPositionY != currentPositionY) {
      currentPositionY = retornoPositionY + this.TAB_SIZE;
    }

    currentPositionY = this.addParamDimensionamento(doc, currentPositionY);

    if (!!this.observacao) {
      currentPositionY += this.TAB_SIZE;
      const budgetInfo3 = [
        ["Observações:", this.observacao],
      ];

      currentPositionY = this.addLabeledData(doc, currentPositionY, budgetInfo3, true);
    }

    currentPositionY += this.TAB_SIZE * 2;

    //incluir evaporadoras
    currentPositionY = this.addEvaporadoras(doc, currentPositionY);

    //incluir as combinações
    currentPositionY = this.addCombinacoes(doc, currentPositionY);

    if (doc.internal.pageSize.height - currentPositionY <
      this.SMALL_FONT_SIZE * 2 + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPaginaPDF(doc, undefined);
    }
    //colocar o texto antes do rodapé
    this.addTextoRodape(doc, currentPositionY + this.TAB_SIZE * 5);

    const generateDate = new Date();
    this.addPageFooter(doc, generateDate);

    return (currentPositionY += 50);
  }

  addDadosCliente(doc, currentPositionY) {
    if (!this.nomeCliente && !this.nomeObra && !this.telefone &&
      !this.email && !this.instalador && !this.telInstalador) {
      return currentPositionY;
    }

    currentPositionY = this.addSubtitulo(doc, currentPositionY, "Dados do cliente", undefined, undefined);
    let budgetInfo = [];
    if (!!this.nomeCliente) {
      budgetInfo.push(["Nome:", this.nomeCliente]);
    }
    if (!!this.nomeObra) {
      budgetInfo.push(["Nome da obra:", this.nomeObra]);
    }
    if (!!this.email) {
      budgetInfo.push(["E-mail:", this.email]);
    }
    if (!!this.telefone) {
      let ddd = this.telefone.substring(0, 2);
      let tel = this.telefone.substring(2);
      let telFormatado = FormataTelefone.telefone_ddd_formata(tel, ddd);
      budgetInfo.push(["Telefone:", telFormatado]);
    }
    if (!!this.instalador) {
      budgetInfo.push(["Instalador:", this.instalador]);
    }
    if (!!this.telInstalador) {
      let ddd = this.telInstalador.substring(0, 2);
      let tel = this.telInstalador.substring(2);
      let telFormatado = FormataTelefone.telefone_ddd_formata(tel, ddd);
      budgetInfo.push(["Telefone instalador:", telFormatado]);
    }

    currentPositionY = this.addLabeledData(doc, currentPositionY, budgetInfo, false);

    return currentPositionY;
  }

  addParamDimensionamento(doc, currentPositionY) {
    currentPositionY = this.addSubtitulo(doc, currentPositionY, "Parâmetros de dimensionamento", undefined, undefined);

    let simultaneidadeMin = this.simultaneidade.split("|", 2)[0];
    let simultaneidadeMax = this.simultaneidade.split("|", 2)[1];

    const budgetInfo2 = [
      ["Fabricante:", this.lstFabricantes.filter(x => x.value == this.fabricanteSelecionado)[0].label],
      ["Voltagem:", `${this.lstVoltagens.filter(x => x.value == this.voltagem)[0].label}V`],
      ["Tipo de descarga:", this.lstDescargas.filter(x => x.value == this.descarga)[0].label],
      ["Ciclo:", this.lstCiclos.filter(x => x.value == this.ciclo)[0].label],
      ["Faixa simultaneidade:", `${simultaneidadeMin}% a ${simultaneidadeMax}%`],
    ];
    currentPositionY = this.addLabeledData(doc, currentPositionY, budgetInfo2, false);

    return currentPositionY;
  }

  addTitulo(doc, currentPositionY, title, withLine) {
    doc
      .setFontSize(this.TITLE_FONT_SIZE)
      .setFont(undefined, "bold")
      .text(title, 2 * this.TAB_SIZE, currentPositionY);

    doc.setFontSize(this.NORMAL_FONT_SIZE).setFont(undefined, "normal");

    if (withLine) {
      doc
        .setDrawColor("#000")
        .line(
          2 * this.TAB_SIZE,
          currentPositionY + 5,
          doc.getTextWidth(title) * 1.7,
          currentPositionY + 5
        );
    }

    return (currentPositionY += this.TITLE_FONT_SIZE + 10);
  }

  addSubtitulo(doc, currentPositionY, title, withLine, twoTitle) {
    doc
      .setFontSize(this.SUBTITLE_FONT_SIZE)
      .setFont(undefined, "bold")
      .text(title, 2 * this.TAB_SIZE, currentPositionY);

    if (!!twoTitle) {
      let twoTitleWidth = doc.getTextWidth(twoTitle);
      doc
        .setFontSize(this.SUBTITLE_FONT_SIZE)
        .setFont(undefined, "bold")
        .text(twoTitle, doc.internal.pageSize.width - twoTitleWidth - (this.TAB_SIZE * 2), currentPositionY);
    }

    doc.setFontSize(this.NORMAL_FONT_SIZE).setFont(undefined, "normal");

    if (withLine) {
      doc
        .setDrawColor("#000")
        .line(
          2 * this.TAB_SIZE,
          currentPositionY + 5,
          doc.internal.pageSize.width - 2 * this.TAB_SIZE,
          currentPositionY + 5
        );
    }

    return (currentPositionY += this.SUBTITLE_FONT_SIZE);
  }

  addLabeledData(doc: jsPDF, currentPositionY: number, data, splitText: boolean) {
    doc.setFontSize(this.NORMAL_FONT_SIZE);

    data.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      const labelWidth = doc
        .text(label, 2 * this.TAB_SIZE, currentPositionY)
        .getTextWidth(label);
      if (splitText) {
        let maxDescriptionWidth = doc.internal.pageSize.width - 4 * this.TAB_SIZE - labelWidth;
        const descriptionLines = doc.splitTextToSize(
          value,
          maxDescriptionWidth
        );
        descriptionLines.forEach((line, index) => {
          doc.setFont(undefined, "normal");
          doc.text(line, 2 * this.TAB_SIZE + labelWidth + 2, currentPositionY, {
            maxWidth: maxDescriptionWidth,
            lineHeightFactor: 1.5,
          });

          if (
            doc.internal.pageSize.height - currentPositionY <
            this.NORMAL_FONT_SIZE + this.FOOTER_MARGIN
          ) {
            currentPositionY = this.addPaginaPDF(doc, undefined);
          } else {
            currentPositionY += this.NORMAL_FONT_SIZE;
          }
        });
      }
      else {
        doc.setFont(undefined, "normal");
        doc.text(`${value}`, 2 * this.TAB_SIZE + labelWidth + 2, currentPositionY);
        currentPositionY += this.NORMAL_FONT_SIZE;
      }
    });

    return currentPositionY;
  }

  buscarDataNomePDF(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}`;
  }

  addEvaporadoras(doc: jsPDF, currentPositionY: number) {
    let optionTitle = `Evaporadora(s)`;
    currentPositionY = this.addSubtitulo(doc, currentPositionY, optionTitle, true, undefined);

    currentPositionY = this.addHeaderEvapsPDF(doc, currentPositionY);

    let btuTotal = 0;
    let kcalTotal = 0;
    this.evaporadorasSelecionadas.forEach((product) => {
      currentPositionY = this.addProdutoEvap(doc, currentPositionY, product);
      btuTotal += !product.btu ? 0 : Number.parseInt(product.btu) * product.qtde;
      kcalTotal += !product.kcal ? 0 : Number.parseInt(product.kcal) * product.qtde;
    });

    currentPositionY += 5;

    let btuTotalString = btuTotal == 0 ? "" : btuTotal.toLocaleString("pt-br");
    let kcalTotalString = kcalTotal == 0 ? "" : kcalTotal.toLocaleString("pt-br");
    const budgetInfo = [
      ["Capacidade total (BTU/h):", `${btuTotalString}`],
      ["Capacidade total (kCal/h):", `${kcalTotalString}`],
    ];

    if (doc.internal.pageSize.height - currentPositionY <
      this.SMALL_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPaginaPDF(doc, undefined);
    }
    currentPositionY = this.addLabeledDataEvaps(doc, currentPositionY, budgetInfo);

    currentPositionY += this.TAB_SIZE * 2;

    return (currentPositionY += this.SUBTITLE_FONT_SIZE - 2);
  }

  addHeaderEvapsPDF(doc: jsPDF, currentPositionY: number) {
    doc
      .setFontSize(this.NORMAL_FONT_SIZE)
      .setTextColor("#000")
      .setFont(undefined, "bold");

    doc.text("Descrição", 3 * this.TAB_SIZE, currentPositionY + 10);
    doc.text("Qtde", 250, currentPositionY + 10, {
      align: "right",
    });
    doc.text(
      "Capacidade (BTU/h)",
      333,
      currentPositionY + 10,
      {
        align: "right",
      }
    );
    doc.text(
      "Capacidade (kCal/h)",
      doc.internal.pageSize.width - 3.5 * this.TAB_SIZE,
      currentPositionY + 10,
      {
        align: "right",
      }
    );

    return currentPositionY += 20;
  }

  addProdutoEvap(doc, currentPositionY, product: ProdutoTabela) {
    doc.setFont(undefined, "normal").setFontSize(this.SMALL_FONT_SIZE);

    const maxDescriptionWidth = 260;

    const productDescription = `${product.fabricante}/${product.produto} - ${product.descricao}`;

    const descriptionLines = doc.splitTextToSize(
      productDescription,
      maxDescriptionWidth
    );

    if (
      doc.internal.pageSize.height - currentPositionY <
      descriptionLines.length * this.SMALL_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPaginaPDF(doc, undefined);
    }

    let descriptionY = currentPositionY;

    doc
      .setDrawColor("#a5a5a5")
      .line(
        3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE,
        doc.internal.pageSize.width - 3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE
      );

    descriptionLines.forEach((line) => {
      doc.text(line, 3 * this.TAB_SIZE, descriptionY, {
        maxWidth: maxDescriptionWidth,
        lineHeightFactor: 1.5,
      });

      descriptionY += this.SMALL_FONT_SIZE;
    });

    doc.text(`${product.qtde}`, 249, currentPositionY, { align: "right" });

    doc.text(
      `${!product.btu ? "" : Number.parseInt(product.btu).toLocaleString("pt-br")}`,
      332,
      currentPositionY,
      { align: "right" }
    );

    doc.text(
      `${!product.kcal ? "" : Number.parseInt(product.kcal).toLocaleString("pt-br")}`,
      doc.internal.pageSize.width - 4 * this.TAB_SIZE,
      currentPositionY,
      { align: "right" }
    );

    if (descriptionLines.length > 1) {
      currentPositionY += this.SMALL_FONT_SIZE * (descriptionLines.length - 1);
    }

    return (currentPositionY += this.SMALL_FONT_SIZE + 3);
  }

  addLabeledDataEvaps(doc: jsPDF, currentPositionY: number, data) {
    doc.setFontSize(this.SMALL_FONT_SIZE);


    data.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      const valueWidth = doc.getTextWidth(value);
      const labelWidth = doc.getTextWidth(label);
      doc.text(label, doc.internal.pageSize.width - 3 * this.TAB_SIZE - valueWidth - 2, currentPositionY, { align: "right" })

      doc.setFont(undefined, "normal");

      doc.text(`${value}`, doc.internal.pageSize.width - 3 * this.TAB_SIZE, currentPositionY, { align: "right" });
      currentPositionY += this.SMALL_FONT_SIZE;
    });

    return currentPositionY;
  }

  addCombinacoes(doc: jsPDF, currentPositionY: number) {
    let combinacoes = [this.combinacaoCom1aparelhos, this.combinacaoCom2aparelhos, this.combinacaoCom3aparelhos];
    let opcoesSelecionadas = [this.opcao1, this.opcao2, this.opcao3];
    let simultaneidades = [this.simultaneidadeCalculada1aparelho, this.simultaneidadeCalculada2aparelhos, this.simultaneidadeCalculada3aparelhos];
    combinacoes.forEach((c: ProdutoTabela[], index) => {
      if(opcoesSelecionadas[index]){
        if (c.length > 0) {
          let optionTitle = `Opção com ${index + 1} condensadora(s)`;
  
          if (doc.internal.pageSize.height - currentPositionY <
            this.SUBTITLE_FONT_SIZE + this.FOOTER_MARGIN
          ) {
            currentPositionY = this.addPaginaPDF(doc, undefined);
          }
  
          currentPositionY = this.addSubtitulo(doc, currentPositionY, optionTitle, true, `Simultaneidade: ${simultaneidades[index]}%`);
  
          currentPositionY = this.addHeaderCondPDF(doc, currentPositionY);
  
          let kcalTotal = 0;
          let hpTotal = 0;
          c.forEach((product) => {
            currentPositionY = this.addProdutoCond(doc, currentPositionY, product);
            console.log(Number.parseInt(product.hp) * product.qtde);
            hpTotal += !product.hp ? 0 : Number.parseInt(product.hp) * product.qtde;
            kcalTotal += !product.kcal ? 0 : Number.parseInt(product.kcal) * product.qtde;
          });
  
          let kcalTotalString = kcalTotal == 0 ? "" : kcalTotal.toLocaleString("pt-br");
          let hpTotalString = hpTotal == 0 ? "" : hpTotal.toLocaleString("pt-br");
          const budgetInfo = [
            ["Capacidade total (kCal/h):", `${kcalTotalString}`],
            ["Potência total (HP):", `${hpTotalString}`],
          ];
  
          if (doc.internal.pageSize.height - currentPositionY <
            this.SMALL_FONT_SIZE + this.FOOTER_MARGIN
          ) {
            currentPositionY = this.addPaginaPDF(doc, undefined);
          }
          currentPositionY = this.addLabeledDataEvaps(doc, currentPositionY, budgetInfo);
  
          currentPositionY += this.TAB_SIZE;
        }
      }
    });

    return (currentPositionY += this.SUBTITLE_FONT_SIZE - 2);
  }

  addHeaderCondPDF(doc: jsPDF, currentPositionY: number) {
    if (doc.internal.pageSize.height - currentPositionY <
      this.NORMAL_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPaginaPDF(doc, undefined);
    }
    doc
      .setFontSize(this.NORMAL_FONT_SIZE)
      .setTextColor("#000")
      .setFont(undefined, "bold");

    doc.text("Descrição", 3 * this.TAB_SIZE, currentPositionY + 10);
    doc.text("Qtde", 250, currentPositionY + 10, {
      align: "right",
    });
    doc.text(
      "Capacidade (kCal/h)",
      333,
      currentPositionY + 10,
      {
        align: "right",
      }
    );
    doc.text(
      "Potência (HP)",
      doc.internal.pageSize.width - 3.5 * this.TAB_SIZE,
      currentPositionY + 10,
      {
        align: "right",
      }
    );

    return currentPositionY += 20;
  }

  addProdutoCond(doc: jsPDF, currentPositionY, product: ProdutoTabela) {
    doc.setFont(undefined, "normal").setFontSize(this.SMALL_FONT_SIZE);

    const maxDescriptionWidth = 260;

    const productDescription = `${product.fabricante}/${product.produto} - ${product.descricao}`;

    const descriptionLines = doc.splitTextToSize(
      productDescription,
      maxDescriptionWidth
    );

    if (
      doc.internal.pageSize.height - currentPositionY <
      descriptionLines.length * this.SMALL_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      doc.setDrawColor("#000");
      currentPositionY = this.addPaginaPDF(doc, undefined);
    }

    let descriptionY = currentPositionY;

    doc
      .setDrawColor("#a5a5a5")
      .line(
        3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE,
        doc.internal.pageSize.width - 3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE
      );

    descriptionLines.forEach((line) => {
      doc.text(line, 3 * this.TAB_SIZE, descriptionY, {
        maxWidth: maxDescriptionWidth,
        lineHeightFactor: 1.5,
      });

      descriptionY += this.SMALL_FONT_SIZE;
    });

    doc.text(`${product.qtde}`, 249, currentPositionY, { align: "right" });

    doc.text(
      `${!product.kcal ? "" : Number.parseInt(product.kcal).toLocaleString("pt-br")}`,
      332,
      currentPositionY,
      { align: "right" }
    );

    doc.text(
      `${!product.hp ? "" : Number.parseInt(product.hp).toLocaleString("pt-br")}`,
      doc.internal.pageSize.width - 4 * this.TAB_SIZE,
      currentPositionY,
      { align: "right" }
    );

    if (descriptionLines.length > 1) {
      currentPositionY += this.SMALL_FONT_SIZE * (descriptionLines.length - 1);
    }

    return (currentPositionY += this.SMALL_FONT_SIZE + 3);
  }

  addTextoRodape(doc: jsPDF, currentPositionY: number) {

    const maxDescriptionWidth = doc.internal.pageSize.width - 4 * this.TAB_SIZE - 5;
    

    const productDescription = this.textoRodape;

    const descriptionLines = doc.splitTextToSize(
      productDescription,
      maxDescriptionWidth
    );

    let descriptionY = currentPositionY - this.SMALL_FONT_SIZE * 3;

    if (doc.internal.pageSize.height - descriptionY <
      this.SMALL_FONT_SIZE * 2 + this.FOOTER_MARGIN
    ) {
      descriptionY = this.addPaginaPDF(doc, undefined);
      descriptionY += this.TAB_SIZE / 2;
    }

    doc
      .setDrawColor("#000")
      .rect(
        2 * this.TAB_SIZE,
        descriptionY - 5 - this.TAB_SIZE,
        doc.internal.pageSize.width - 4 * this.TAB_SIZE,
        this.SMALL_FONT_SIZE * 3
      );

    descriptionLines.forEach((line) => {
      doc
        .setFontSize(this.SMALL_FONT_SIZE)
        .setFont(undefined, "bold")
        .text(line, this.TAB_SIZE * 2 + maxDescriptionWidth / 2 + 2, descriptionY - 5, {
          maxWidth: maxDescriptionWidth,
          lineHeightFactor: 1.5,
          align: "center"
        });

      descriptionY += this.SMALL_FONT_SIZE;
    });

    // doc.setFont(undefined, "normal");
  }

  addPageFooter(doc, generateDate) {
    const totalPages = doc.internal.getNumberOfPages();

    doc.setFontSize(this.SMALL_FONT_SIZE).setFont(undefined, "italic");

    const footerDescription = `PDF gerado em ${this.getFormattedFooterDate(
      generateDate
    )}`;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageFooter = `Página ${i} de ${totalPages}`;

      doc
        .text(
          footerDescription,
          doc.internal.pageSize.width / 2 -
          doc.getTextWidth(footerDescription) / 2,
          doc.internal.pageSize.height - this.SMALL_FONT_SIZE * 1.8
        )
        .text(
          pageFooter,
          doc.internal.pageSize.width - doc.getTextWidth(pageFooter) / 2 - 45,
          doc.internal.pageSize.height - this.SMALL_FONT_SIZE * 1.8
        )
        .setFillColor("#000")
        .rect(
          2 * this.TAB_SIZE,
          doc.internal.pageSize.height - this.FOOTER_MARGIN,
          doc.internal.pageSize.width - 4 * this.TAB_SIZE,
          0.5,
          "F"
        );
    }
  }

  getFormattedFooterDate(date: Date): string {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .format(date)
      .replace(", ", " às ");
  }
}
