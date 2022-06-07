import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { ProdutoCatalogoFabricante } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoFabricante';
import { ProdutoCatalogoItemProdutosAtivosDados } from 'src/app/dto/produtos-catalogo/produtos-catalogos-propriedades-ativos';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { ProdutoCatalogoService } from 'src/app/service/produtos-catalogo/produto.catalogo.service';
import { eDescarga } from 'src/app/utilities/enums/eDescarga';
import { eSimultaneidade } from 'src/app/utilities/enums/eSimultaneidade';
import { eVoltagem } from 'src/app/utilities/enums/eVoltagens';
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
  lstVoltagens: SelectItem[] = [];
  lstDescargas: SelectItem[] = [];
  lstQtdeCondensadoras: SelectItem[] = [];
  carregando: boolean = false;
  produtosPropriedadesAtivos: ProdutoCatalogoItemProdutosAtivosDados[];
  evaporadoras= new Array<ProdutoTabela>();
  condensadoras: ProdutoCatalogoItemProdutosAtivosDados[];
  produtosDados: ProdutoCatalogoItemProdutosAtivosDados[];

  ngOnInit(): void {
    this.criarForm();
    this.buscarProduto();
    this.buscarFabricantes();
    this.buscarSimultaneidades();
    this.buscarVoltagens();
    this.buscarDescargas();
    this.buscarQtdeMaxCondensadoras();

  }

  criarForm() {
    this.form = this.fb.group({
      fabricante: ['', [Validators.required]],
      simultaneidade: ['', [Validators.required]],
      voltagem: ['', [Validators.required]],
      descarga: ['', [Validators.required]],
      condensadora: ['', [Validators.required]],
      nomeCliente: ['', [Validators.required]],
      nomeObra: ['', [Validators.required]],
      obs: ['']
    });
  }


  buscarProduto() {
    this.produtoService.listarProdutosPropriedadesAtivos(false, false).toPromise().then((r) => {
      if (r != null) {
        this.produtosDados = r;
        this.filtrarEvaporadoras();
      }
    }).catch((e) => {
      console.log(e);
    });
  }

  filtrarEvaporadoras() {
    //buscar produtos que são vrf
    let produtosVrf = this.produtosDados.filter(x => Number.parseInt(x.idPropriedade) == 1 && x.idValorPropriedadeOpcao == 12);

    //montar tabelaDados para poder filtar os produtos mais facilmente
    produtosVrf.forEach(x => {
      //verificar se é evaporadora
      let evap = this.produtosDados.filter(e => e.produto == x.produto && Number.parseInt(e.idPropriedade) == 2 && e.idValorPropriedadeOpcao == 22);

      if (evap.length > 0) {
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
          this.evaporadoras.push(produtoTabela);
        }
      }
    });
  }



  buscarFabricantes() {
    let lstFabricantes = [];
    var indice = 0;

    this.produtoService.buscarFabricantes().toPromise().then((r) => {
      if (r != null) {
        while (indice < r.length) {
          lstFabricantes.push({ title: r[indice]['Descricao'], value: r[indice]['Fabricante'], label: r[indice]['Nome'] })
          indice++;
        }

        this.lstFabricantes = lstFabricantes;
        this.fabricantes = r;
        this.carregando = false;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
    this.lstVoltagens.push({ title: eVoltagem.DuzentoEVinte, value: eVoltagem.DuzentoEVinte, label: eVoltagem.DuzentoEVinte },
      { title: eVoltagem.TrezentosEOitenta, value: eVoltagem.TrezentosEOitenta, label: eVoltagem.TrezentosEOitenta });
  }

  buscarDescargas() {
    this.lstDescargas.push({ title: eDescarga.Vertical, value: eDescarga.Vertical, label: eDescarga.Vertical },
      { title: eDescarga.Horizontal, value: eDescarga.Horizontal, label: eDescarga.Horizontal });
  }

  buscarQtdeMaxCondensadoras() {
    this.lstQtdeCondensadoras.push({ title: "1", value: 1, label: "1" },
      { title: "2", value: 2, label: "2" },
      { title: "3", value: 3, label: "3" });
  }

  adicionarEvaporadoras(){
    const ref = this.dialogService.open(SelectEvapDialogComponent,
      {
        width: "80%",
        styleClass: 'dynamicDialog',
        data: this.evaporadoras
      });
  }
}
