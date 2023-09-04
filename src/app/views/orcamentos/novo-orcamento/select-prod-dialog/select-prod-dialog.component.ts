import { Component, OnInit, Inject, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { SelecProdInfo } from './selec-prod-info';
import { ProdutoTela } from './produto-tela';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { DropDownItem } from '../../models/DropDownItem';
//import { ProdutoDto } from 'src/app/dto/produtos/ProdutoDto';
//import { arrayToHash } from '@fullcalendar/core/util/object';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { GrupoSubgrupoProdutoRequest } from 'src/app/dto/produtos/grupo-subgrupo-produto-request';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

@Component({
  selector: 'app-select-prod-dialog',
  templateUrl: './select-prod-dialog.component.html',
  styleUrls: ['./select-prod-dialog.component.scss']
})
export class SelectProdDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public readonly mensagemService: MensagemService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private produtoService: ProdutoService,
    private readonly alertaService: AlertaService,
    private readonly sweetAlertService: SweetalertService,
    public cdref: ChangeDetectorRef) {
    super(telaDesktopService)
  }

  @ViewChild('dataTable') table: Table;
  displayModal: boolean = false;
  selecProdInfoPassado: SelecProdInfo;
  public prodsTela: ProdutoTela[] = new Array();
  public prodsArray: ProdutoTela[] = new Array();
  prodsArrayApoio: ProdutoTela[] = new Array();
  public moedaUtils: MoedaUtils = new MoedaUtils();
  selecionados: Array<ProdutoTela>;
  codigo: string;
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;
  stringUtils = StringUtils;
  first: number = 0;
  fabricantes: Array<DropDownItem> = new Array<DropDownItem>();
  fabricantesSelecionados: Array<string>;
  categorias: Array<DropDownItem> = new Array<DropDownItem>();
  categoriasSelecionadas: Array<string>;
  ciclos: Array<DropDownItem> = new Array<DropDownItem>();
  cicloSelecionado: string;
  capacidades: Array<DropDownItem> = new Array<DropDownItem>();
  capacidadesSelecionadas: Array<string>;
  produto: string;
  carregando: boolean;

  ngOnInit(): void {
    this.carregando = true;
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.montarComboFabricante();
    this.buscarCategorias();
    this.montarCiclos();
    this.montarCapacidades();
    this.transferirDados();

    this.novoOrcamentoService.pageItens = this.telaDesktop ? 3 : 6;
  }
  public combo: ProdutoComboDto = new ProdutoComboDto();

  public limiteMaximo = 1000 * 1000;
  transferirDados() {

    const limite = this.limiteMaximo;
    for (let copiar = 0; copiar < this.selecProdInfoPassado.produtoComboDto.produtosSimples.length; copiar++) {
      //acabou?
      if (!(this.prodsArrayApoio.length < this.selecProdInfoPassado.produtoComboDto.produtosSimples.length))
        break;
      //colocamos mais um
      let xy = new ProdutoTela(this.selecProdInfoPassado.produtoComboDto.produtosSimples[copiar],
        this.selecProdInfoPassado.produtoComboDto.produtosCompostos);

      let existe = false;
      this.selecProdInfoPassado.produtoComboDto.produtosCompostos.some(x => {
        let ff = x.filhos.filter(y => y.produto == xy.produtoDto.produto);

        if (ff.length > 0) {
          existe = true;
          return true
        }
      });
      if (!existe) {
        if (xy.produtoDto.unitarioVendavel)
          xy.visivel = false;
        this.prodsArrayApoio.push(xy);
      }
    }
  }

  montarComboFabricante() {
    this.selecProdInfoPassado.produtoComboDto.produtosSimples.forEach(e => {
      this.fabricantes.push({ Id: e.fabricante, Value: e.fabricante_Nome });
    });

    const key = "Value";
    this.fabricantes = [... new Map(this.fabricantes.map(item => [item[key], item])).values()];
    this.fabricantes.sort((a, b) => a.Value.toUpperCase().localeCompare(b.Value.toUpperCase()));
  }

  buscarCategorias() {
    let request = new GrupoSubgrupoProdutoRequest();
    request.loja = this.novoOrcamentoService.autenticacaoService._lojaLogado;
    this.produtoService.buscarGruposSubgruposProdutos(request).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        return;
      }

      r.listaGruposSubgruposProdutos.forEach(x => {
        this.categorias.push({ Id: x.codigo, Value: x.descricao });
      });
      this.carregando = false;
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    });
  }

  montarCiclos() {

    let produtosSimples = Object.assign([], this.selecProdInfoPassado.produtoComboDto.produtosSimples);
    this.selecProdInfoPassado.produtoComboDto.produtosSimples.forEach(e => {

      if (!e.ciclo) {

        let filhos = this.selecProdInfoPassado.produtoComboDto.produtosCompostos.filter(x => x.paiProduto == e.produto)[0]?.filhos;
        if (filhos) {
          let filhotes = filhos.map(x => x.produto);

          let filhotesSimples = produtosSimples.filter(f => filhotes.includes(f.produto));
          filhotesSimples.forEach(el => {
            if (el.ciclo) {
              if (!el.cicloDescricao) {
                this.ciclos.push({ Id: el.ciclo, Value: el.ciclo });
              }
              else {
                this.ciclos.push({ Id: el.ciclo, Value: el.cicloDescricao });
              }
            }
          });
        }
      }
      else {
        if (e.ciclo) {
          if (!e.cicloDescricao) {
            this.ciclos.push({ Id: e.ciclo, Value: e.ciclo });
          }
          else {
            this.ciclos.push({ Id: e.ciclo, Value: e.cicloDescricao });
          }
        }
      }
    });

    const key = "Id";
    this.ciclos = [... new Map(this.ciclos.map(item => [item[key], item])).values()];
    this.ciclos.sort((a, b) => a.Value.toUpperCase().localeCompare(b.Value.toUpperCase()));
  }

  montarCapacidades() {
    let produtosSimples = Object.assign([], this.selecProdInfoPassado.produtoComboDto.produtosSimples);
    this.selecProdInfoPassado.produtoComboDto.produtosSimples.forEach(e => {

      if (!e.capacidade) {

        let filhos = this.selecProdInfoPassado.produtoComboDto.produtosCompostos.filter(x => x.paiProduto == e.produto)[0]?.filhos;
        if (filhos) {
          let filhotes = filhos.map(x => x.produto);

          let filhotesSimples = produtosSimples.filter(f => filhotes.includes(f.produto));
          filhotesSimples.forEach(el => {
            if (el.capacidade) {
              this.capacidades.push({ Id: el.capacidade, Value: el.capacidade });
            }
          });
        }
      }
      else {
        if (e.ciclo) {
          this.capacidades.push({ Id: e.capacidade, Value: e.capacidade.toString() });
        }
      }
    });

    const key = "Id";
    this.capacidades = [... new Map(this.capacidades.map(item => [item[key], item])).values()];
    this.capacidades.sort((a, b) => Number.parseInt(a.Id.toString()) - Number.parseInt(b.Id.toString()));
  }

  pesquisar() {

    if (!this.produto &&
      (!this.fabricantesSelecionados || this.fabricantesSelecionados.length == 0) &&
      (!this.categoriasSelecionadas || this.categoriasSelecionadas.length == 0) &&
      (!this.cicloSelecionado || this.cicloSelecionado.length == 0) &&
      (!this.capacidadesSelecionadas || this.capacidadesSelecionadas.length == 0)) {
      this.alertaService.mostrarMensagem("Preencha pelo menos um filtro para pesquisa!");
      return;
    }

    if (this.selecionados && this.selecionados.length > 0) {
      this.sweetAlertService.dialogo("", "Os itens selecionados não foram adicionados.<br> Pretende continuar?").subscribe((r) => {
        if (!r) {
          return;
        }
        else {
          this.selecionados = new Array<ProdutoTela>();
          this.buscarProdutos();
        }
      });
    }
    else {
      this.buscarProdutos();
    }
  }

  buscarProdutos() {
    this.prodsArrayApoio.forEach(x => {
      x.qtde = 0;
    })

    this.prodsTela = undefined;
    this.cdref.detectChanges();
    this.prodsArray = { ...this.prodsArrayApoio };
    let lstParaFiltro = Object.assign([], this.prodsArray);

    if (this.produto && this.produto.length >= 2) {
      lstParaFiltro = this.filtrarPorProduto(this.produto, lstParaFiltro);
    }

    let lstFabr = new Array<ProdutoTela>();
    lstFabr = this.filtrarPorFabricante(lstParaFiltro);
    let lstCat = new Array<ProdutoTela>();
    lstCat = this.filtrarPorCategorias(lstFabr);
    let lstCic = new Array<ProdutoTela>();
    lstCic = this.filtrarPorCiclo(lstCat);
    let lstCap = new Array<ProdutoTela>();
    lstCap = this.filtrarPorCapacidades(lstCic);

    this.prodsTela = lstCap;
    this.prodsTela = this.prodsTela.sort((a, b) => a.produtoDto.produto.localeCompare(b.produtoDto.produto));
  }

  filtrarPorFabricante(lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (this.fabricantesSelecionados && this.fabricantesSelecionados.length > 0) {
      let produtosFiltrados = lista.filter(x => this.fabricantesSelecionados.includes(x.produtoDto.fabricante));
      produtosFiltrados.forEach(x => {
        x.visivel = true;
      });
      retorno = produtosFiltrados;
      return retorno;
    }

    ProdutoTela.AtualizarVisiveis(lista, "");
    retorno = lista.filter(f => f.visivel == true);
    return retorno;
  }

  filtrarPorCategorias(lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (this.categoriasSelecionadas && this.categoriasSelecionadas.length > 0) {
      this.categoriasSelecionadas.forEach(x => {
        ProdutoTela.AtualizarVisiveis(lista, "/" + x + "/");
        let filtrados = lista.filter(f => f.visivel == true);
        retorno = retorno.concat(filtrados);
      });

      const key = "produtoDto";
      retorno = [... new Map(retorno.map(item => [item[key], item])).values()];
      retorno = retorno.sort((a, b) => a.produtoDto.produto.localeCompare(b.produtoDto.produto));

      return retorno;
    }

    ProdutoTela.AtualizarVisiveis(lista, "");
    retorno = lista.filter(f => f.visivel == true);

    return retorno;
  }

  filtrarPorCiclo(lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (this.cicloSelecionado) {
      ProdutoTela.AtualizarVisiveis(lista, "/" + this.cicloSelecionado + "/");
      let filtrados = lista.filter(f => f.visivel == true);

      retorno = filtrados;

      const key = "produtoDto";
      retorno = [... new Map(retorno.map(item => [item[key], item])).values()];
      retorno = retorno.sort((a, b) => a.produtoDto.produto.localeCompare(b.produtoDto.produto));

      return retorno;
    }

    ProdutoTela.AtualizarVisiveis(lista, "");
    retorno = lista.filter(f => f.visivel == true);

    return retorno;
  }

  filtrarPorProduto(digitado: string, lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (digitado != "" && digitado.length >= 2) {
      for (let i = 0; i < lista.length; i++) {
        lista[i].visivel = false;
        if (lista[i].produtoDto.produto.indexOf(digitado) > -1 && lista[i].produtoDto.unitarioVendavel) {
          lista[i].visivel = true;
          continue;
        }
        else if (lista[i].Filhos.length > 0) {
          let filho = lista[i].Filhos.filter(x => x.produto.indexOf(digitado) > -1);
          if (filho.length > 0) {
            lista[i].visivel = true;
            continue;
          }
        }
        else {
          lista[i].visivel = false;
        }
      }
    }
    retorno = lista.filter(f => f.visivel == true);

    return retorno;
  }

  filtrarPorCapacidades(lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (this.capacidadesSelecionadas && this.capacidadesSelecionadas.length > 0) {
      this.capacidadesSelecionadas.forEach(x => {
        ProdutoTela.AtualizarVisiveis(lista, "/" + x + "/");
        let filtrados = lista.filter(f => f.visivel == true);
        retorno = retorno.concat(filtrados);
      });

      const key = "produtoDto";
      retorno = [... new Map(retorno.map(item => [item[key], item])).values()];
      retorno = retorno.sort((a, b) => a.produtoDto.produto.localeCompare(b.produtoDto.produto));

      return retorno;
    }

    ProdutoTela.AtualizarVisiveis(lista, "");
    retorno = lista.filter(f => f.visivel == true);

    return retorno;
  }

  digitado: string = "";
  digitouProd(e: Event) {
    this.digitado = ((e.target) as HTMLInputElement).value;
    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);

    this.prodsTela = { ...this.prodsArray.filter(f => f.visivel == true) };
  }

  addProduto() {
    if (this.selecionados && this.selecionados.length > 0) {
      let qtdeItens: number = 0;
      this.selecionados.forEach(p => {
        if (p.Filhos.length > 0) {
          p.Filhos.forEach(x => {
            let produto = this.novoOrcamentoService.controleProduto.filter(c => c == x.produto)[0];
            if (!produto) {
              this.novoOrcamentoService.controleProduto.push(x.produto);
              qtdeItens++;
            }
          });
        }
        else {
          let produto = this.novoOrcamentoService.controleProduto.filter(c => c == p.produtoDto.produto)[0];
          if (!produto) {
            this.novoOrcamentoService.controleProduto.push(p.produtoDto.produto);
            qtdeItens++;
          }
        }

        if (this.novoOrcamentoService.controleProduto.length > this.novoOrcamentoService.limiteQtdeProdutoOpcao) {
          this.novoOrcamentoService.controleProduto.splice(this.novoOrcamentoService.controleProduto.length - qtdeItens, qtdeItens);
          this.mensagemService.showWarnViaToast("A quantidade de itens excede a quantidade máxima de itens permitida por opção!");
          return;
        }
      });
      this.ref.close(this.selecionados);
      return;
    }
    
    let msg: string[] = new Array();
    msg.push("Por favor, selecione um produto!");
    this.mensagemService.showErrorViaToast(msg);
  }

  produtoDescr(fabricante: string, produto: string) {
    let p = this.selecProdInfoPassado.produtoComboDto.produtosSimples.filter(el => el.fabricante == fabricante && el.produto == produto)[0];
    return p;
  }

  addQtde(produto: ProdutoTela) {

    if (!this.selecionados) {
      this.selecionados = new Array<ProdutoTela>();
    }

    let linha = document.getElementById(`linha_tabela_${produto.produtoDto.produto}`) as HTMLElement;
    linha.classList.add("p-highlight");

    produto.qtde++;

    let selecionado = this.selecionados.filter(x => x.produtoDto.produto == produto.produtoDto.produto)[0];
    if (!selecionado) {
      this.selecionados.push(produto);
    }
  }

  subtrairQtde(produto: ProdutoTela, index: number) {

    if (!this.selecionados) return;
    if (produto.qtde == 0) return;

    if ((produto.qtde - 1) == 0) {
      //desmarcar
      let linha = document.getElementById(`linha_tabela_${produto.produtoDto.produto}`) as HTMLElement;
      linha.classList.remove("p-highlight");
      this.selecionados = this.selecionados.filter(x => x.produtoDto.produto != produto.produtoDto.produto);
    }

    produto.qtde--;
  }

  formatarQtde(e: Event, produto: ProdutoTela): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    v = valor.replace(/[^0-9]/g, '');
    if (!v) {
      v = 0;
    }

    if (!this.selecionados) {
      this.selecionados = new Array<ProdutoTela>();
    }

    let linha = document.getElementById(`linha_tabela_${produto.produtoDto.produto}`) as HTMLElement;
    if (v == 0) {
      linha.classList.remove("p-highlight");
      this.selecionados = this.selecionados.filter(x => x.produtoDto.produto != produto.produtoDto.produto);
    }
    else {

      let selecionado = this.selecionados.filter(x => x.produtoDto.produto == produto.produtoDto.produto)[0];
      if (!selecionado) {
        this.selecionados.push(produto);
      }
      linha.classList.add("p-highlight");
    }
    v = v
    produto.qtde = v;
    ((e.target) as HTMLInputElement).value = v;
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.which == 13) {
      this.pesquisar();
      event.cancelBubble = true;
      event.stopPropagation();
      event.preventDefault();//esse cara que fez a diferença
      event.stopImmediatePropagation();
    }
  }

  fechar() {
    if (this.selecionados && this.selecionados.length > 0) {
      this.sweetAlertService.dialogo("", "Os itens selecionados não foram adicionados.<br> Pretende continuar?").subscribe((r) => {
        if (!r) {
          return;
        }
        else {
          this.selecionados = new Array<ProdutoTela>();
          this.ref.close(this.selecionados);
        }
      });
    } else {
      this.ref.close(this.selecionados);
    }
  }
}
