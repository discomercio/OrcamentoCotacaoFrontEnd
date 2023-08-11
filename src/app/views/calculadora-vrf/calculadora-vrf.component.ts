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
    private readonly orcamentoService: OrcamentosService
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

  ngOnInit(): void {
    this.carregando = true;
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.criarForm2();
    this.buscarSimultaneidades();
    this.buscarQtdeMaxCondensadoras();
    this.dataAtual = new Date().toLocaleString("pt-br");

    let promise: any = [this.buscarProdutos(), this.buscarOpcoes(), this.buscarLogoPDF(), this.buscarTextoRodapePDF()];
    Promise.all(promise).then((r: any) => {
      this.setarProdutos(r[0]);
      this.setarOpcoes(r[1]);
      this.setarLogoPDF(r[2]);
      this.setarTextoRodapePDF(r[3]);
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

  buscarSimultaneidades() {
    this.lstSimultaneidades.push(
      { title: `${eSimultaneidade.Oitenta} a ${eSimultaneidade.Noventa}`, value: `${eSimultaneidade.Oitenta}|${eSimultaneidade.Noventa}`, label: `${eSimultaneidade.Oitenta} a ${eSimultaneidade.Noventa}` },
      { title: `${eSimultaneidade.NoventaEUm} a ${eSimultaneidade.Cem}`, value: `${eSimultaneidade.NoventaEUm}|${eSimultaneidade.Cem}`, label: `${eSimultaneidade.NoventaEUm} a ${eSimultaneidade.Cem}` },
      { title: `${eSimultaneidade.CentoEUm} a ${eSimultaneidade.CentoEDez}`, value: `${eSimultaneidade.CentoEUm}|${eSimultaneidade.CentoEDez}`, label: `${eSimultaneidade.CentoEUm} a ${eSimultaneidade.CentoEDez}` },
      { title: `${eSimultaneidade.CentoEOnze} a ${eSimultaneidade.CentoEVinte}`, value: `${eSimultaneidade.CentoEOnze}|${eSimultaneidade.CentoEVinte}`, label: `${eSimultaneidade.CentoEOnze} a ${eSimultaneidade.CentoEVinte}` },
      { title: `${eSimultaneidade.CentoEVinteEUm} a ${eSimultaneidade.CentoETrinta}`, value: `${eSimultaneidade.CentoEVinteEUm}|${eSimultaneidade.CentoETrinta}`, label: `${eSimultaneidade.CentoEVinteEUm} a ${eSimultaneidade.CentoETrinta}` }
    );
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

  mostrarImpressao() {
    if (!this.opcao1 && !this.opcao2 && !this.opcao3) {
      this.mensagemService.showWarnViaToast("Selecione ao menos 1 opção!");
      return;
    }
    this.imprimindo = true;
  }

  gerarPDF1pagina(doc: jsPDF, htmlPdf: HTMLElement, margins: any) {

    doc.html(htmlPdf, {
      margin: [margins.top, margins.right, margins.bottom, margins.left],
      callback: (doc) => {
        doc.text('página 1', 520.3 / 2, 842 - 20);
        doc.save('calculo_vrf');
        let x: string = doc.output('bloburl').toString();
        window.open(x);
        this.imprimindo = false;
      }
    });
    return;
  }

  gerarPDF2paginas(doc: jsPDF, margins: any, alturaPagina: number) {


    let logo = document.getElementById("logo").cloneNode(true) as HTMLElement;
    let titulo = document.getElementById("titulo").cloneNode(true) as HTMLElement;
    let formulario = document.getElementById("formulario").cloneNode(true) as HTMLElement;
    let opcao1;
    let opcao2;
    let opcao3;

    let filho = document.getElementById("div-filho");
    let filho2 = filho.cloneNode(true) as HTMLElement;

    filho.append(logo);
    filho.append(titulo);
    filho.append(formulario);

    filho2.append(logo.cloneNode(true) as HTMLElement);
    let evaps = document.getElementById("evaps");
    if (filho.clientHeight + evaps.clientHeight > alturaPagina) {
      filho2.append(evaps.cloneNode(true) as HTMLElement);
    }
    else {
      filho.append(evaps.cloneNode(true) as HTMLElement);
    }

    if (this.opcao1) {
      opcao1 = document.getElementById("opcao1");
      if (filho2.clientHeight > 0) {
        //evaps jão esta na folha2
        filho2.append(opcao1.cloneNode(true) as HTMLElement);
      }
      else if (filho.clientHeight + opcao1.clientHeight > alturaPagina) {
        //jogamos para outra página
        filho2.append(opcao1.cloneNode(true) as HTMLElement);
      }
      else {
        filho.append(opcao1.cloneNode(true) as HTMLElement);
      }
    }

    if (this.opcao2) {
      opcao2 = document.getElementById("opcao2");
      if (filho2.clientHeight > 0) {
        //evaps jão esta na folha2
        filho2.append(opcao2.cloneNode(true) as HTMLElement);
      }
      else if (filho.clientHeight + opcao2.clientHeight > alturaPagina) {
        //jogamos para outra página
        filho2.append(opcao2.cloneNode(true) as HTMLElement);
      }
      else {
        filho.append(opcao2.cloneNode(true) as HTMLElement);
      }
    }

    if (this.opcao3) {
      opcao3 = document.getElementById("opcao3");

      if (filho2.clientHeight > 0) {
        filho2.append(opcao3.cloneNode(true) as HTMLElement);
      }
      else if (filho.clientHeight + opcao3.clientHeight > alturaPagina) {
        filho2.append(opcao3.cloneNode(true) as HTMLElement);

      }
      else {
        filho.append(opcao3.cloneNode(true) as HTMLElement);
      }
    }

    let rodape = document.getElementById("rodape");
    filho2.append(rodape.cloneNode(true) as HTMLElement);

    let pai = document.getElementById("div-pai").cloneNode(true) as HTMLElement;
    pai.append(filho.cloneNode(true) as HTMLElement);

    doc.html(pai, {
      margin: [margins.top, margins.right, margins.bottom, margins.left],
      callback: (doc) => {
        doc.text('página 1', 520.3 / 2, 842 - 20);
        doc.addPage('pt', 'p');
        doc.html(filho2, {
          margin: [0, margins.right, margins.bottom, margins.left],
          callback: (doc) => {
            doc.text('página 2', 520.3 / 2, 842 - 25);
            doc.save('calculo_vrf');
            let x: string = doc.output('bloburl').toString();
            window.open(x);
            while (filho.hasChildNodes()) {
              filho.removeChild(filho.firstChild);
            };
            this.imprimindo = false;
          }, y: 855
        });
      }, html2canvas: { scale: 1 }
    });
  }

  exportPdf() {

    let doc = new jsPDF('p', 'pt', 'a4');

    let margins = {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    };

    let alturaPagina = 842 - 80;
    doc.setProperties({ title: "calculo_vrf" });
    doc.setFontSize(2);

    let htmlPdf = document.getElementById("html-pdf");

    let altHtmlPdf = htmlPdf.clientHeight;

    if (altHtmlPdf < alturaPagina) {
      this.gerarPDF1pagina(doc, htmlPdf, margins);
      return;
    }

    this.gerarPDF2paginas(doc, margins, alturaPagina);
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
        produtoTabela.linhaBusca = produtoTabela.fabricante;
        produtoTabela.produto = lista[0].produto;
        produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.produto;
        produtoTabela.descricao = lista[0].descricao;
        produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.descricao;
        produtoTabela.qtde = 0;

        let voltagem: boolean = false;
        let descarga: boolean = false;
        let kw: boolean = false;
        let ciclo: boolean = false;

        lista.forEach(l => {

          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + (l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao);

          if (l.idPropriedade == 4 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            voltagem = true;
            produtoTabela.voltagem = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }

          if (l.idPropriedade == 3) {
            descarga = true;
            produtoTabela.descarga = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }

          if (l.idPropriedade == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kw = l.valorPropriedade.replace(",", ".");
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.kw;
          }

          if (l.idPropriedade == 10 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kcal = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.kcal;
          }

          if (l.idPropriedade == 11 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.hp = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.hp;
          }

          if (l.idPropriedade == 6 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            ciclo = true;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
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
          produtoTabela.linhaBusca = produtoTabela.fabricante;
          produtoTabela.produto = lista[0].produto;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.produto;
          produtoTabela.descricao = lista[0].descricao;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.descricao;

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

            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + (l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao);
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

    const ref = this.dialogService.open(SelectEvapDialogComponent,
      {
        width: "80%",
        data: { evaps: this.filtrarEvaporadoras(), opcoes: this.lstOpcoes }
      });

    ref.onClose.subscribe((resultado: ProdutoTabela) => {
      if (resultado) {

        this.arrumarProdutosRepetidos(resultado);
        this.digitouQte(resultado);
        this.limparCombinacoesCondensadoras();
      }
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
          x.qtde = x.qtde == undefined ? 1 : x.qtde + 1;
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
      produto2.qtde = 1;
      produto2.linhaBusca = produto.linhaBusca;
      produto2.linhaProduto = produto.linhaProduto;
      this.evaporadorasSelecionadas.push(produto2);
    }
  }

  buscarCiclos() {
    let ciclos = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 6)

    ciclos.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstCiclos.push(opcao);
    });
  }

  filtrarCondensadoras() {

    this.condensadorasFiltradas = new Array();
    this.condensadorasFiltradas = this.condensadoras;
    if (this.evaporadorasSelecionadas.findIndex(x => x.linhaBusca.includes("302")) > -1) {
      this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes("302"));
    }

    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.fabricante == this.fabricanteSelecionado);
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes("|" + this.ciclo + "|"));
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(this.voltagem.toString()));
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(this.descarga.toString()));
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
      if (simultaneidade <= simultaneidadeMaxFloat && simultaneidade >= simultaneidadeMinFloat)
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
      if (simultaneidade <= simultaneidadeMaxFloat && simultaneidade >= simultaneidadeMinFloat) {
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
      if (simultaneidade <= simultaneidadeMaxFloat && simultaneidade >= simultaneidadeMinFloat) {
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
}
