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
  ) { }

  form: FormGroup;
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
  totalKcalEvaporadoras: number;

  stringUtils = StringUtils;
  mensagemErro: string = "*Campo obrigatório.";

  ngOnInit(): void {
    this.criarForm();
    this.buscarProduto();
    this.buscarOpcoes();
    this.buscarSimultaneidades();
    this.buscarQtdeMaxCondensadoras();
  }

  criarForm() {
    this.form = this.fb.group({
      fabricante: ['', [Validators.required]]
    });
  }


  buscarProduto() {
    this.produtoService.listarProdutosPropriedadesAtivos(false, false).toPromise().then((r) => {
      if (r != null) {
        this.produtosDados = r;
        this.filtrarProdutosVrf();

      }
    }).catch((e) => {
      console.log(e);
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
        produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.produto;
        produtoTabela.descricao = lista[0].descricao;
        produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.descricao;

        let voltagem: boolean = false;
        let descarga: boolean = false;
        let kcal: boolean = false;

        lista.forEach(l => {
          //voltagem
          if (Number.parseInt(l.idPropriedade) == 4 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            voltagem = true;
            produtoTabela.voltagem = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.voltagem;
          }
          //descarga
          if (Number.parseInt(l.idPropriedade) == 3) {
            descarga = true;
            produtoTabela.descarga = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.descarga;
          }

          //kcal
          if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
            kcal = true;
            produtoTabela.kcal = l.valorPropriedade;
            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.kcal;
          }
        });

        if (voltagem && descarga && kcal) {
          this.condensadoras.push(produtoTabela);
        }
      }
    });

    console.log(this.condensadoras);
  }

  buscarEvaporadoras() {
    //montar tabelaDados para poder filtar os produtos mais facilmente
    this.produtosVrf.forEach(x => {
      //verificar se é evaporadora
      let evap = this.produtosDados.filter(e => e.produto == x.produto && Number.parseInt(e.idPropriedade) == 2 && e.idValorPropriedadeOpcao == 22);

      if (evap.length > 0) {

        let lista = this.produtosDados.filter(p => p.produto == x.produto);

        //kcal é obrigatório para poder calcular evaporadoras
        let temKcal = lista.filter(t => Number.parseInt(t.idPropriedade) == 7 && (t.valorPropriedade != null && t.valorPropriedade != ''));

        if (temKcal.length > 0) {
          let produtoTabela = new ProdutoTabela();
          produtoTabela.id = lista[0].id;
          produtoTabela.fabricante = lista[0].fabricante;
          produtoTabela.linhaBusca = produtoTabela.fabricante;
          produtoTabela.produto = lista[0].produto;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.produto;
          produtoTabela.descricao = lista[0].descricao;
          produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + produtoTabela.descricao;

          lista.forEach(l => {
            if (Number.parseInt(l.idPropriedade) == 7 && (l.valorPropriedade != null && l.valorPropriedade != '')) {
              produtoTabela.kcal = l.valorPropriedade;
            }

            produtoTabela.linhaBusca = produtoTabela.linhaBusca + "/" + l.valorPropriedade;
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
    let fabricante = this.form.controls.fabricante.value;

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
      }
    });
  }

  removerItem(index: number) {
    let produto = this.evaporadorasSelecionadas.splice(index, 1)[0];
    this.digitouQte(produto);
  }

  digitouQte(produto: ProdutoTabela) {
    if (produto.qtde <= 0) produto.qtde = 1;


    this.totalKcalEvaporadoras = this.evaporadorasSelecionadas.reduce((sum, current) => sum + (Number.parseFloat(current.kcal) * current.qtde), 0);
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
}
