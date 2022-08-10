import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import autoTable from 'jspdf-autotable'
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { JsonpClientBackend } from '@angular/common/http';

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
    private readonly autenticacaoService: AutenticacaoService
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

  nomeCliente: string;
  nomeObra: string;
  telefone: string;
  email: string;
  observacao: string;
  instalador: string;
  telInstalador: string;

  mascaraTelefone: string;
  calculado: boolean = false;
  desabilita: boolean = false;
  lstCiclos: SelectItem[] = [];
  ciclo: string;

  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.buscarProduto();
    this.buscarOpcoes();
    this.buscarSimultaneidades();
    this.buscarQtdeMaxCondensadoras();
  }

  montarDadosParaPDF(produto: ProdutoTabela[]) {
    let retorno = [];

    produto.forEach(x => {
      if (x.totalKcal == undefined) {
        let dado = [this.stringUtils.formatarDescricao(x.fabricante, '', x.produto, x.descricao), x.qtde, x.kcal]
        retorno.push(dado);
      }
      if (x.totalKcal > 0) {
        let dado = [this.stringUtils.formatarDescricao(x.fabricante, '', x.produto, x.descricao), x.qtde, x.btu, x.kcal, x.totalKcal]
        retorno.push(dado);
      }
    });
    return retorno;
  }

  exportPdf() {
    //Buscar a imagem conforme a unidade de negocio
    let img = new Image();
    //buscar por param de unidade de negócio
    img.src = this.autenticacaoService._lojaEstilo.imagemLogotipo;;

    let doc = new jsPDF();

    // Logo
    if (img.src.includes('Unis')) doc.addImage(img, 'png', 14, 10, 15, 10);
    else doc.addImage(img, 'png', 14, 10, 17, 10);
    //titulo
    doc.setFont(undefined, 'bold').setFontSize(16).text("Resumo do Sistema VRF", 70, 25);
    //1ª linha
    let inicio = 14;
    let linha = 37;
    if (!!this.nomeCliente) {
      doc.setFont('helvetica', 'normal').setFontSize(11).text("Cliente:", inicio, linha);
      doc.setFontSize(11).text(this.nomeCliente != undefined ? this.nomeCliente : '', 28, linha, {
        maxWidth: 54,
        align: 'left'
      });
    }

    let meio = 80;
    if (!!this.nomeObra) {
      if (!!this.nomeCliente)
        doc.setFont('helvetica', 'normal').setFontSize(11).text("Nome da Obra:", meio, linha);
      else
        doc.setFont('helvetica', 'normal').setFontSize(11).text("Nome da Obra:", inicio, linha);

      doc.setFontSize(11).text(this.nomeObra != undefined ? this.nomeObra : '', 108, linha, {
        maxWidth: 45,
        align: 'left'
      });
    }

    let fim = 153;
    if (!!this.telefone) {

      doc.setFont('helvetica', 'normal').setFontSize(11).text("Telefone:", fim, linha);


      doc.setFontSize(11).text(this.telefone != undefined ? this.stringUtils.formataTextoTelefone(this.telefone) : '', 170, linha, {
        maxWidth: 30,
        align: 'left'
      });
    }


    doc.setFont('helvetica', 'normal').setFontSize(11).text("E-mail:", 14, 44);
    doc.setFontSize(11).text(this.email != undefined ? this.email : '', 27, 44, {
      maxWidth: 75,
      align: 'left'
    });

    doc.setFont('helvetica', 'normal').setFontSize(11).text("Observações:", 108, 44);
    doc.setFontSize(11).text(this.observacao != undefined ? this.observacao : '', 133, 44, {
      maxWidth: 66,
      align: 'left'
    });

    let columnsEvaps = [['Produto', 'Qtde', 'Capacidade(BTU/h)', 'Capacidade(Kcal/h)', 'Total(Kcal/h)']];

    doc.setFont('helvetica', 'bold').setFontSize(11).text("Evaporadoras", 14, 60);
    autoTable(doc, {
      head: columnsEvaps,
      body: this.montarDadosParaPDF(this.evaporadorasSelecionadas),
      styles: { halign: 'center' },
      startY: 61,
      didParseCell: (data) => {
        if (data.column.dataKey == 0) {
          data.cell.styles.halign = "left";
        }
      }
    });

    const head = [['Produto', 'Quantidade', 'Capacidade(Kcal/h)']];

    doc.setFont('helvetica', 'bold').setFontSize(11).text("Opção com 1 condensadora", 14, 120);
    doc.setFont('helvetica', 'bold').setFontSize(11).text("Simultaneidade:", 151, 120, { align: 'left' });
    doc.setFont('helvetica', 'bold').setFontSize(11).text(this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.simultaneidadeCalculada1aparelho) + " %", 182, 120, { align: 'left', maxWidth: 19 });
    let produtos = this.montarDadosParaPDF(this.combinacaoCom1aparelhos);
    if (produtos.length <= 0) {

    }
    let data = produtos.splice(1, 1);
    autoTable(doc, {
      head: head,
      body: produtos.length <= 0 ? [["Não existem condensadoras para esse conjunto de evaporadoras"]] : produtos,
      styles: { halign: 'center' },
      startY: 122,
      foot: [['', "Total: ", this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.somarTotalCondensadoras(this.combinacaoCom1aparelhos))]],
      didParseCell: (data) => {
        if (data.column.dataKey == 0) {
          data.cell.styles.halign = "left";
        }
      }
    });


    if (this.descarga != 52) {
      doc.setFont('helvetica', 'bold').setFontSize(11).text("Opção com 2 condensadoras", 14, 165);
      doc.setFont('helvetica', 'bold').setFontSize(11).text("Simultaneidade:", 151, 165, { align: 'left' });
      doc.setFont('helvetica', 'bold').setFontSize(11).text(this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.simultaneidadeCalculada2aparelhos) + " %", 182, 165, { align: 'left', maxWidth: 19 });
      produtos = this.montarDadosParaPDF(this.combinacaoCom2aparelhos);
      data = produtos.splice(1, 2);
      autoTable(doc, {
        head: head,
        body: produtos.length <= 0 ? [["Não existem condensadoras para esse conjunto de evaporadoras"]] : produtos,
        styles: { halign: 'center' },
        startY: 167,
        foot: [['', "Total: ", this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.somarTotalCondensadoras(this.combinacaoCom2aparelhos))]],
        didParseCell: (data) => {
          if (data.column.dataKey == 0) {
            data.cell.styles.halign = "left";
          }
        }
      });
    }

    if (this.descarga != 52) {
      doc.setFont('helvetica', 'bold').setFontSize(11).text("Opção com 3 condensadoras", 14, 210);
      doc.setFont('helvetica', 'bold').setFontSize(11).text("Simultaneidade:", 151, 210, { align: 'left' });
      doc.setFont('helvetica', 'bold').setFontSize(11).text(this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.simultaneidadeCalculada3aparelhos) + " %", 182, 210, { align: 'left', maxWidth: 19 });
      produtos = this.montarDadosParaPDF(this.combinacaoCom3aparelhos);
      autoTable(doc, {
        head: head,
        body: produtos.length <= 0 ? [["Não existem condensadoras para esse conjunto de evaporadoras"]] : produtos,
        styles: { halign: 'center' },
        startY: 212,
        foot: [['', "Total: ", this.moedaUtils.formatarParaFloatUmaCasaReturnZero(this.somarTotalCondensadoras(this.combinacaoCom3aparelhos))]],
        didParseCell: (data) => {
          if (data.column.dataKey == 0) {
            data.cell.styles.halign = "left";
          }
        }
      });
    }

    doc.setFont('helvetica', 'bold').setFontSize(8).text("ATENÇÃO:", 14, 280);
    let rodape = "O CALCULO É REALIZADO ATRAVÉS DA SIMULTANEIDADE APROXIMADA DE ACORDO COM O MANUAL TÉCNICO DO " +
      "FABRICANTE. PARA MAIS INFORMAÇÕES , ENTRE EM CONTATO COM NOSSA EQUIPE COMERCIAL: SP - (11) 4858-2434";
    doc.setFont('helvetica', 'normal').setFontSize(8).text(rodape, 30, 280, { maxWidth: 174 });

    doc.setProperties({ title: "calculo_vrf" });
    doc.save('calculo_vrf');
    let x: string = doc.output('bloburl').toString();
    window.open(x);
  }

  criarForm() {
    this.form = this.fb.group({
      fabricanteSelecionado: ['', [Validators.required]]
    });

    this.form2 = this.fb.group({
      voltagem: ['', [Validators.required]],
      descarga: ['', [Validators.required]],
      simultaneidade: ['', [Validators.required]],
      qtdeCondensadora: ['', [Validators.required]],
      ciclo: ['', [Validators.required]]
    })
  }

  buscarProduto() {
    this.carregando = true;
    this.produtoService.listarProdutosPropriedadesAtivos(false, false).toPromise().then((r) => {
      if (r != null) {
        this.produtosDados = r;
        this.filtrarProdutosVrf();
      }
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    });
  }

  filtrarProdutosVrf() {
    this.produtosVrf = this.produtosDados.filter(x => Number.parseInt(x.idPropriedade) == 1 && x.idValorPropriedadeOpcao == 12);

    this.buscarEvaporadoras();
    this.buscarFabricantes();
    this.buscarCondensadoras();
    this.carregando = false;
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
        produtoTabela.qtde = 0;

        let voltagem: boolean = false;
        let descarga: boolean = false;
        let kw: boolean = false;
        let ciclo: boolean = false;

        lista.forEach(l => {

          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + (l.idValorPropriedadeOpcao == 0 ? l.valorPropriedade : l.idValorPropriedadeOpcao);

          if (Number.parseInt(l.idPropriedade) == 4 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            voltagem = true;
            produtoTabela.voltagem = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }

          if (Number.parseInt(l.idPropriedade) == 3) {
            descarga = true;
            produtoTabela.descarga = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + l.idValorPropriedadeOpcao;
          }

          if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kw = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.kw;
          }

          if (Number.parseInt(l.idPropriedade) == 10 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.kcal = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.kcal;
          }

          if (Number.parseInt(l.idPropriedade) == 11 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kw = true;
            produtoTabela.hp = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "|" + produtoTabela.hp;
          }

          if (Number.parseInt(l.idPropriedade) == 6 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
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
      let evap = this.produtosDados.filter(e => e.produto == x.produto && Number.parseInt(e.idPropriedade) == 2 && e.idValorPropriedadeOpcao == 22);

      if (evap.length > 0) {
        let lista = this.produtosDados.filter(p => p.produto == x.produto);

        let temKw = lista.filter(t => Number.parseInt(t.idPropriedade) == 7 && (t.valorPropriedade != null && t.valorPropriedade != ''));

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
            if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
              produtoTabela.kw = l.valorPropriedade;
            }
            if (Number.parseInt(l.idPropriedade) == 5) {
              produtoTabela.btu = l.valorPropriedade;
            }
            if (Number.parseInt(l.idPropriedade) == 10) {
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
        this.buscarCiclos();
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
    this.lstSimultaneidades.push(
      { title: `${eSimultaneidade.Oitenta} a ${eSimultaneidade.Noventa}`, value: `${eSimultaneidade.Oitenta}|${eSimultaneidade.Noventa}`, label: `${eSimultaneidade.Oitenta} a ${eSimultaneidade.Noventa}` },
      { title: `${eSimultaneidade.NoventaEUm} a ${eSimultaneidade.Cem}`, value: `${eSimultaneidade.NoventaEUm}|${eSimultaneidade.Cem}`, label: `${eSimultaneidade.NoventaEUm} a ${eSimultaneidade.Cem}` },
      { title: `${eSimultaneidade.CentoEUm} a ${eSimultaneidade.CentoEDez}`, value: `${eSimultaneidade.CentoEUm}|${eSimultaneidade.CentoEDez}`, label: `${eSimultaneidade.CentoEUm} a ${eSimultaneidade.CentoEDez}` },
      { title: `${eSimultaneidade.CentoEOnze} a ${eSimultaneidade.CentoEVinte}`, value: `${eSimultaneidade.CentoEOnze}|${eSimultaneidade.CentoEVinte}`, label: `${eSimultaneidade.CentoEOnze} a ${eSimultaneidade.CentoEVinte}` },
      { title: `${eSimultaneidade.CentoEVinteEUm} a ${eSimultaneidade.CentoETrinta}`, value: `${eSimultaneidade.CentoEVinteEUm}|${eSimultaneidade.CentoETrinta}`, label: `${eSimultaneidade.CentoEVinteEUm} a ${eSimultaneidade.CentoETrinta}` }
    );
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
    let repetidos = this.evaporadorasSelecionadas.filter(x => x.produto == produto.produto);

    if (repetidos.length >= 1) {
      this.evaporadorasSelecionadas.forEach(x => {
        const index = this.evaporadorasSelecionadas.findIndex(f => f.produto == produto.produto);
        if (x.produto == produto.produto) {
          x.qtde = x.qtde == undefined ? 1 : x.qtde + 1;
          this.digitouQte(x);
          return;
        }
      });
    }
    else {
      this.evaporadorasSelecionadas.push(produto);
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
    this.simultaneidade = "";
    this.qtdeCondensadora = 0;
  }

  calcularCondensadoras() {

    if (!this.validacaoFormularioService.validaForm(this.form2)) {
      return;
    }

    if (this.evaporadorasSelecionadas.length <= 0) {
      this.mensagemService.showWarnViaToast("Por favor, selecione evaporadoras antes de calcular condensadoras!");
      return;
    }

    this.limparCombinacoesCondensadoras();

    let somaCapacidadeEvaporadoras = this.evaporadorasSelecionadas
      .reduce((sum, current) => sum + (Number.parseFloat(current.kw) * current.qtde), 0);

    let simultaneidadeMin = this.simultaneidade.split("|", 2)[0];
    let simultaneidadeMinFloat = Number.parseFloat(simultaneidadeMin);

    let simultaneidadeMax = this.simultaneidade.split("|", 2)[1];
    let simultaneidadeMaxFloat = Number.parseFloat(simultaneidadeMax);

    this.filtrarCondensadoras();

    let capacidadeMinima = somaCapacidadeEvaporadoras / (simultaneidadeMaxFloat / 100);

    this.combinacaoCom1aparelhos = this.buscarMelhorCombinacao1Condensadora(capacidadeMinima, this.condensadorasFiltradas,
      simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);

    this.combinacaoCom2aparelhos = this.buscarMelhorCombinacao2Condensadoras(capacidadeMinima, this.condensadorasFiltradas,
      simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);

    this.combinacaoCom3aparelhos = this.buscarMelhorCombinacao3Condensadoras(capacidadeMinima, this.condensadorasFiltradas,
      simultaneidadeMaxFloat, simultaneidadeMinFloat, somaCapacidadeEvaporadoras);

    this.calculado = true;
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
      if (JSON.stringify(retorno).indexOf(x.id) > -1) {
        let item = retorno.filter(p => p.id == x.id)[0];
        item.qtde += 1;
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

  somarTotalCondensadoras(lstCondensadora: ProdutoTabela[]) {
    return lstCondensadora
      .reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);
  }
}
