import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, SelectMultipleControlValueAccessor, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { eDescarga } from 'src/app/utilities/enums/eDescarga';
import { eSimultaneidade } from 'src/app/utilities/enums/eSimultaneidade';
import { eVoltagem } from 'src/app/utilities/enums/eVoltagens';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { SelectEvapDialogComponent } from './select-evap-dialog/select-evap-dialog.component';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable'
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

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
    private readonly sweetalertService: SweetalertService
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

  carregando: boolean = false;
  produtosPropriedadesAtivos: ProdutoCatalogoItemProdutosAtivosDados[];
  evaporadoras = new Array<ProdutoTabela>();
  condensadoras = new Array<ProdutoTabela>();
  produtosDados: ProdutoCatalogoItemProdutosAtivosDados[];
  produtosVrf: ProdutoCatalogoItemProdutosAtivosDados[];
  evaporadorasSelecionadas = new Array<ProdutoTabela>();
  condensadorasSelecionadas = new Array<ProdutoTabela>();
  condensadorasFiltradas: ProdutoTabela[] = [];
  combinacaoCom3aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada3aparelhos: number;
  combinacaoCom2aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada2aparelhos: number;
  combinacaoCom1aparelhos: ProdutoTabela[] = [];
  simultaneidadeCalculada1aparelho: number;

  totalKcalEvaporadoras: number;
  simultaneidade: number;
  qtdeCondensadora: number;
  voltagem: number;
  descarga: number;
  fabricante: string;
  fabricanteSelecionado: string;

  stringUtils = StringUtils;
  moedaUtils = new MoedaUtils();
  mensagemErro: string = "*Campo obrigatório.";

  ngOnInit(): void {
    this.criarForm();
    this.buscarProduto();
    this.buscarOpcoes();
    this.buscarSimultaneidades();
    this.buscarQtdeMaxCondensadoras();
    // Validar e mostrar opções de condensadoras conforme a quantidade selecionada
    // incluir mais campos na tabela que são utilizados nos filtros 
    //criar view child para o pdf
  }

  export() {
    let doc = new jsPDF();

    const head = [['ID', 'Country', 'Index', 'Capital']]
    const data = [
      [1, 'Gabriel', 7.632, 'Helsinki'],
      [2, 'Norway', 7.594, 'Oslo'],
      [3, 'Denmark', 7.555, 'Copenhagen'],
      [4, 'Iceland', 7.495, 'Reykjavík'],
      [5, 'Switzerland', 7.487, 'Bern'],
      [9, 'Sweden', 7.314, 'Stockholm'],
      [73, 'Belarus', 5.483, 'Minsk'],
    ]

    autoTable(doc, {
      html: "dataTable3",
      didDrawCell: (data) => { },
    });
    autoTable(doc, {
        head: head,
        body: data,
        didDrawCell: (data) => { },
    });
    // doc.save('table.pdf');
    doc.output('dataurlnewwindow');
  }
  montarDadosParaPDF(produto:ProdutoTabela[]){
    let retorno= [];
    produto.forEach(x =>{
      let dado = [this.stringUtils.formatarDescricao(x.fabricante, '', x.produto, x.descricao), x.kcal, x.qtde]
      retorno.push(dado);
    });
    debugger;
    return retorno;
  }
  exportPdf() {
    let doc = new jsPDF();

    const head = [['Produto', 'Capacidade(Kcal/h)', 'Quantidade']]
    let data = this.montarDadosParaPDF(this.combinacaoCom3aparelhos);
    autoTable(doc, {
      head: head,
      body: data,
      didDrawCell: (data) => { },
    });
    data = this.montarDadosParaPDF(this.combinacaoCom2aparelhos);
    autoTable(doc, {
      head: head,
      body: data,
      didDrawCell: (data) => { },
    });
    data = this.montarDadosParaPDF(this.combinacaoCom1aparelhos);
    autoTable(doc, {
      head: head,
      body: data,
      didDrawCell: (data) => { },
    });
    doc.output('dataurlnewwindow');
  }

  criarForm() {
    this.form = this.fb.group({
      fabricanteSelecionado: ['', [Validators.required]]
    });

    this.form2 = this.fb.group({
      voltagem: ['', [Validators.required]],
      descarga: ['', [Validators.required]],
      simultaneidade: ['', [Validators.required]],
      qtdeCondensadora: ['', [Validators.required]]
    })
  }

  buscarProduto() {
    this.produtoService.listarProdutosPropriedadesAtivos(false, false).toPromise().then((r) => {
      if (r != null) {
        this.produtosDados = r;
        this.filtrarProdutosVrf();
      }
    }).catch((e) => {

    });
  }

  filtrarProdutosVrf() {
    this.produtosVrf = this.produtosDados.filter(x => Number.parseInt(x.idPropriedade) == 1 && x.idValorPropriedadeOpcao == 12);

    this.buscarFabricantes();
    this.buscarEvaporadoras();
    this.buscarCondensadoras();
  }

  buscarCondensadoras() {
    this.produtosVrf.forEach(x => {
      let cond = this.produtosDados.filter(e => e.produto == x.produto && Number.parseInt(e.idPropriedade) == 2 && e.idValorPropriedadeOpcao == 21);

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

        let voltagem: boolean = false;
        let descarga: boolean = false;
        let kcal: boolean = false;
        let ciclo: boolean = false;

        lista.forEach(l => {

          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + (l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao);
          //voltagem
          if (Number.parseInt(l.idPropriedade) == 4 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            voltagem = true;
            produtoTabela.voltagem = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }
          //descarga
          if (Number.parseInt(l.idPropriedade) == 3) {
            descarga = true;
            produtoTabela.descarga = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }
          //kcal
          if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kcal = true;
            produtoTabela.kcal = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.kcal;
          }
          if (Number.parseInt(l.idPropriedade) == 6 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            ciclo = true;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }
        });

        if (voltagem && descarga && kcal && ciclo) {
          this.condensadoras.push(produtoTabela);
        }
      }
    });
  }

  buscarEvaporadoras() {
    this.produtosVrf.forEach(x => {
      let evap = this.produtosDados.filter(e => e.produto == x.produto && Number.parseInt(e.idPropriedade) == 2 && e.idValorPropriedadeOpcao == 22);

      if (evap.length > 0) {
        let lista = this.produtosDados.filter(p => p.produto == x.produto);

        let temKcal = lista.filter(t => Number.parseInt(t.idPropriedade) == 7 && (t.valorPropriedade != null && t.valorPropriedade != ''));

        if (temKcal.length > 0) {
          let produtoTabela = new ProdutoTabela();
          produtoTabela.id = lista[0].id;
          produtoTabela.fabricante = lista[0].fabricante;
          produtoTabela.linhaBusca = produtoTabela.fabricante;
          produtoTabela.produto = lista[0].produto;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.produto;
          produtoTabela.descricao = lista[0].descricao;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.descricao;

          lista.forEach(l => {
            if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
              produtoTabela.kcal = l.valorPropriedade;
            }

            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + (l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao);
          });
          this.evaporadoras.push(produtoTabela);
        }
      }
    });
  }

  buscarOpcoes() {
    this.produtoService.buscarOpcoes().toPromise().then((r) => {
      if (r != null) {
        this.lstOpcoes = r;
        this.buscarVoltagens();
        this.buscarDescargas();
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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

  buscarSimultaneidades() {
    this.lstSimultaneidades.push({ title: eSimultaneidade.Noventa, value: eSimultaneidade.Noventa, label: eSimultaneidade.Noventa },
      { title: eSimultaneidade.VoventaECinco, value: eSimultaneidade.VoventaECinco, label: eSimultaneidade.VoventaECinco },
      { title: eSimultaneidade.Cem, value: eSimultaneidade.Cem, label: eSimultaneidade.Cem },
      { title: eSimultaneidade.CentoECinco, value: eSimultaneidade.CentoECinco, label: eSimultaneidade.CentoECinco },
      { title: eSimultaneidade.CentoEDez, value: eSimultaneidade.CentoEDez, label: eSimultaneidade.CentoEDez },
      { title: eSimultaneidade.CentoEQuinze, value: eSimultaneidade.CentoEQuinze, label: eSimultaneidade.CentoEQuinze },
      { title: eSimultaneidade.CentoEVinte, value: eSimultaneidade.CentoEVinte, label: eSimultaneidade.CentoEVinte },
      { title: eSimultaneidade.CentoEVinteECinco, value: eSimultaneidade.CentoEVinteECinco, label: eSimultaneidade.CentoEVinteECinco });
  }

  buscarVoltagens() {
    let voltagens = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 4);

    voltagens.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstVoltagens.push(opcao);
    });
  }

  buscarDescargas() {
    let descargas = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 3);

    descargas.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstDescargas.push(opcao);
    });
  }

  buscarQtdeMaxCondensadoras() {
    this.lstQtdeCondensadoras.push({ title: "1", value: 1, label: "1" },
      { title: "2", value: 2, label: "2" },
      { title: "3", value: 3, label: "3" });
  }

  filtrarEvaporadoras(): ProdutoTabela[] {
    let fabricante = this.form.controls.fabricanteSelecionado.value;

    return this.evaporadoras.filter(x => x.fabricante == fabricante);
  }

  adicionarEvaporadoras() {

    if (!this.validacaoFormularioService.validaForm(this.form)) {
      return;
    }

    const ref = this.dialogService.open(SelectEvapDialogComponent,
      {
        width: "80%",
        styleClass: 'dynamicDialog',
        data: { evaps: this.filtrarEvaporadoras(), opcoes: this.lstOpcoes }
      });

    ref.onClose.subscribe((resultado: ProdutoTabela) => {
      if (resultado) {
        this.arrumarProdutosRepetidos(resultado);
        this.digitouQte(resultado);
        this.limparCombinacoesCondensadoras();
        // this.limparFiltrosCondensadoras();
      }
    });
  }

  removerItem(index: number) {
    let produto = this.evaporadorasSelecionadas.splice(index, 1)[0];
    this.digitouQte(produto);
  }

  digitouQte(produto: ProdutoTabela) {
    this.limparCombinacoesCondensadoras();
    if (produto.qtde <= 0) produto.qtde = 1;

    this.totalKcalEvaporadoras = this.evaporadorasSelecionadas
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);

    if (this.calculado) {
      this.calcularCondensadoras();
    }
  }

  arrumarProdutosRepetidos(produto: ProdutoTabela) {
    let repetidos = this.evaporadorasSelecionadas.filter(x => x.produto == produto.produto);

    if (repetidos.length >= 1) {
      this.evaporadorasSelecionadas.forEach(x => {
        const index = this.evaporadorasSelecionadas.findIndex(f => f.produto == produto.produto);
        if (x.produto == produto.produto) {
          x.qtde++;
          this.digitouQte(x);
          return;
        }
      });
    }
    else {
      this.evaporadorasSelecionadas.push(produto);
    }
  }

  filtrarCondensadoras() {

    this.condensadorasFiltradas = this.condensadoras;
    if (this.evaporadorasSelecionadas.findIndex(x => x.linhaBusca.includes("302")) > -1) {
      this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes("302"));
    }

    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.fabricante == this.fabricanteSelecionado);
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(this.voltagem.toString()));
    this.condensadorasFiltradas = this.condensadorasFiltradas.filter(x => x.linhaBusca.includes(this.descarga.toString()));
  }

  limparFiltros() {
    if (this.evaporadorasSelecionadas.length > 0) {
      this.sweetalertService.confirmarSemMostrar("", "Ao mudar o fabricante, as condensadoras calculadas e as evaporadoras selecionadas serão excluidas! Tem certeza que deseja alterar o fabricante selecionado?").subscribe(result => {
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
  }

  limparFiltrosCondensadoras() {
    this.voltagem = 0;
    this.descarga = 0;
    this.simultaneidade = 0;
    this.qtdeCondensadora = 0;
  }

  calcularCondensadoras() {
    // this.calculado = false;
    if (!this.validacaoFormularioService.validaForm(this.form2)) {
      return;
    }

    if (this.evaporadorasSelecionadas.length <= 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione evaporadoras antes de calcular condensadoras!");
      return;
    }

    this.limparCombinacoesCondensadoras();

    let somaCapacidadeEvaporadoras = this.evaporadorasSelecionadas
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);

    let simultaneidadeFloat = this.simultaneidade / 100;

    this.filtrarCondensadoras();

    let cond = [];
    this.condensadorasFiltradas.forEach(x => {
      cond.push([x.produto, Math.round(Number.parseFloat(x.kcal))])
    });

    let condensadoras3 = this.calcularCombinacaoCom3aparelhos(somaCapacidadeEvaporadoras / simultaneidadeFloat, cond);
    this.simultaneidadeCalculada3aparelhos = this.calcularSimultaneidade(condensadoras3, somaCapacidadeEvaporadoras);
    this.combinacaoCom3aparelhos = this.criarRetornoCondensadoras(condensadoras3);

    let condensadoras2 = this.calcularCombinacaoCom2aparelhos(somaCapacidadeEvaporadoras / simultaneidadeFloat, cond);
    this.simultaneidadeCalculada2aparelhos = this.calcularSimultaneidade(condensadoras2, somaCapacidadeEvaporadoras);
    this.combinacaoCom2aparelhos = this.criarRetornoCondensadoras(condensadoras2);

    let condensadora1 = this.calcularCombinacaoCom1aparelho(somaCapacidadeEvaporadoras / simultaneidadeFloat, cond);
    this.simultaneidadeCalculada1aparelho = this.calcularSimultaneidade(condensadora1, somaCapacidadeEvaporadoras);
    this.combinacaoCom1aparelhos = this.criarRetornoCondensadoras(condensadora1);

    this.calculado = true;
    console.log("qtde condensadoras:{0}", this.qtdeCondensadora);
  }
  calculado: boolean = false;

  criarRetornoCondensadoras(condensadoras: any[]): ProdutoTabela[] {
    let retorno: ProdutoTabela[] = [];

    for (let i = 0; i < condensadoras.length; i++) {
      let produto = this.condensadorasFiltradas.filter(x => x.produto == condensadoras[i][0]);
      if (produto.length > 0) {
        produto[0].qtde = condensadoras[i][2];
        retorno.push(produto[0]);
      }
    }

    return retorno;
  }

  calcularSimultaneidade(arrayProdutosEscolhidos, somaCapacidadeEvaporadoras) {
    let capacidadeProdutosEscolhidos = 0;
    let simultaneidade = 0;
    if (arrayProdutosEscolhidos.length > 0) {
      for (let i1 = 0; i1 < arrayProdutosEscolhidos.length; i1++) {
        capacidadeProdutosEscolhidos += (arrayProdutosEscolhidos[i1][1] * arrayProdutosEscolhidos[i1][2]);
      }
      simultaneidade = somaCapacidadeEvaporadoras / capacidadeProdutosEscolhidos;
    }
    return Math.round(simultaneidade * 10000) / 100;
  }

  unificarEquipamentosIguais(arrayProdutosEscolhidos) {
    let x = 0;
    let arrayCodigos = [];
    let arrayProdutosUnificados = [];
    if (arrayProdutosEscolhidos.length > 0) {
      for (let i = 0; i < arrayProdutosEscolhidos.length; i++) {
        let index = arrayCodigos.indexOf(arrayProdutosEscolhidos[i][0]);
        if (index === -1) {
          arrayCodigos.push(arrayProdutosEscolhidos[i][0]);
          arrayProdutosUnificados[x] = arrayProdutosEscolhidos[i];
          arrayProdutosUnificados[x][2] = 1;
          x++;
        } else {
          arrayProdutosUnificados[index][2] += 1;
        }

      }
    }

    return arrayProdutosUnificados;
  }

  calcularCombinacaoCom1aparelho(capacidadeMinima, arrayCapacidades) {
    let ret = [];
    let minimoAtingido = -1;
    for (let i1 = 0; i1 < arrayCapacidades.length; i1++) {
      let estaCapcidade = arrayCapacidades[i1][1];
      if (estaCapcidade >= capacidadeMinima) {
        if (estaCapcidade < minimoAtingido || minimoAtingido == -1) {
          minimoAtingido = estaCapcidade;
          ret = [[arrayCapacidades[i1][0], arrayCapacidades[i1][1]]];
        }
      }
    }
    return this.unificarEquipamentosIguais(ret);
  }

  calcularCombinacaoCom2aparelhos(capacidadeMinima, arrayCapacidades) {
    let ret = [];
    let minimoAtingido = -1;
    for (let i1 = 0; i1 < arrayCapacidades.length; i1++) {
      for (let i2 = 0; i2 < arrayCapacidades.length; i2++) {
        let estaCapcidade = arrayCapacidades[i1][1] + arrayCapacidades[i2][1];
        if (estaCapcidade >= capacidadeMinima) {
          if (estaCapcidade == minimoAtingido) {
            let variacaoAtual = Math.abs(ret[0][1] - ret[1][1]);
            let candidato = [[arrayCapacidades[i1][0], arrayCapacidades[i1][1]], [arrayCapacidades[i2][0], arrayCapacidades[i2][1]]];
            let variacaoNova = Math.abs(candidato[0][1] - candidato[1][1]);
            if (variacaoNova < variacaoAtual) {
              ret = candidato;
            }
          }
          if (estaCapcidade < minimoAtingido || minimoAtingido == -1) {
            minimoAtingido = estaCapcidade;
            ret = [[arrayCapacidades[i1][0], arrayCapacidades[i1][1]], [arrayCapacidades[i2][0], arrayCapacidades[i2][1]]];
          }
        }
      }
    }
    return this.unificarEquipamentosIguais(ret);
  }

  calcularCombinacaoCom3aparelhos(capacidadeMinima, arrayCapacidades) {
    let ret = [];
    let minimoAtingido = -1;

    for (let i1 = 0; i1 < arrayCapacidades.length; i1++) {
      for (let i2 = 0; i2 < arrayCapacidades.length; i2++) {
        for (let i3 = 0; i3 < arrayCapacidades.length; i3++) {
          let estaCapcidade = arrayCapacidades[i1][1] + arrayCapacidades[i2][1] + arrayCapacidades[i3][1];
          ;
          if (estaCapcidade >= capacidadeMinima) {
            if (estaCapcidade == minimoAtingido) {
              let variacaoAtual = Math.abs(ret[0][1] - ret[1][1]) + Math.abs(ret[0][1] - ret[2][1]) + Math.abs(ret[1][1] - ret[2][1]);
              let candidato = [[arrayCapacidades[i1][0], arrayCapacidades[i1][1]], [arrayCapacidades[i2][0], arrayCapacidades[i2][1]], [arrayCapacidades[i3][0], arrayCapacidades[i3][1]]];
              let variacaoNova = Math.abs(candidato[0][1] - candidato[1][1]) + Math.abs(candidato[0][1] - candidato[2][1]) + Math.abs(candidato[1][1] - candidato[2][1]);
              if (variacaoNova < variacaoAtual) {
                ret = candidato;

              }
            }
            if (estaCapcidade < minimoAtingido || minimoAtingido == -1) {
              minimoAtingido = estaCapcidade;
              ret = [[arrayCapacidades[i1][0], arrayCapacidades[i1][1]], [arrayCapacidades[i2][0], arrayCapacidades[i2][1]], [arrayCapacidades[i3][0], arrayCapacidades[i3][1]]];
            }
          }
        }
      }
    }
    return this.unificarEquipamentosIguais(ret);
  }

somarTotalCondensadoras(lstCondensadora:ProdutoTabela[]){
  return lstCondensadora
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);
}
}
