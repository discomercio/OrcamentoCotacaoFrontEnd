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
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { GrupoSubgrupoProdutoRequest } from 'src/app/dto/produtos/grupo-subgrupo-produto-request';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';

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
  selecionados: Array<ProdutoTela> = new Array<ProdutoTela>();
  codigo: string;
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;
  stringUtils = StringUtils;
  first: number = 0;
  fabricantes: Array<DropDownItem> = new Array<DropDownItem>();
  fabricantesSelecionados: Array<string>;
  categorias: Array<DropDownItem> = new Array<DropDownItem>();
  categoriasSelecionadas: Array<string> = new Array();
  ciclos: Array<DropDownItem> = new Array<DropDownItem>();
  capacidadesSelecionadas: Array<string>;
  capacidades: Array<DropDownItem> = new Array<DropDownItem>();
  cicloSelecionado: string;
  produto: string;

  carregando: boolean;
  cat: string;
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

    if (this.fabricantesSelecionados && this.fabricantesSelecionados.length > 0) {
      this.fabricantesSelecionados = this.fabricantesSelecionados;
    }

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

      if (this.categoriasSelecionadas && this.categoriasSelecionadas.length > 0) {
        this.categoriasSelecionadas = this.categoriasSelecionadas;
      }
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


    if (this.capacidadesSelecionadas && this.capacidadesSelecionadas.length > 0) {
      this.capacidadesSelecionadas = this.capacidadesSelecionadas;
    }

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

    if (this.produto && this.produto.length >= 1) {
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
        let split = x.split("§");
        if (split.length > 1) {
          let pp = lista.filter(f => split[0] == f.produtoDto.grupo && split[1] == f.produtoDto.subgrupo);
          if (pp && pp.length > 0) {
            pp.forEach(f => {
              if (f.visivel && f.produtoDto.unitarioVendavel) {
                retorno.push(f);
              }
            });
          }
        }
        else {
          if (split[0] && !split[1]) {
            let pp = lista.filter(f => split[0] == f.produtoDto.grupo && !f.produtoDto.subgrupo);
            if (pp && pp.length > 0) {
              pp.forEach(f => {
                if (f.visivel && f.produtoDto.unitarioVendavel) {
                  retorno.push(f);
                }
              });
            }
          }
          if (!split[0] && split[1]) {
            let pp = lista.filter(f => !f.produtoDto.grupo && split[1] == f.produtoDto.subgrupo);
            if (pp && pp.length > 0) {
              pp.forEach(f => {
                if (f.visivel && f.produtoDto.unitarioVendavel) {
                  retorno.push(f);
                }
              });
            }
          }
        }
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

      let filtrados = lista.filter(x => this.cicloSelecionado == x.produtoDto.ciclo && x.visivel && x.produtoDto.unitarioVendavel);

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

    ProdutoTela.AtualizarVisiveis(lista, digitado);
    retorno = lista.filter(f => f.visivel == true);

    return retorno;
  }

  filtrarPorCapacidades(lista: ProdutoTela[]) {
    let retorno: ProdutoTela[] = new Array<ProdutoTela>();

    if (this.capacidadesSelecionadas && this.capacidadesSelecionadas.length > 0) {

      this.capacidadesSelecionadas.forEach(x => {
        let p = lista.filter(f => Number.parseInt(x) == f.produtoDto.capacidade);
        if (p && p.length > 0) {
          p.forEach(f => {
            if (f.visivel && f.produtoDto.unitarioVendavel) {
              retorno.push(f);
            }
          });
        }
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

  addProduto(selecionados: ProdutoTela[]) {
    let invalidos = selecionados.filter(x => !x.qtdeValida);
    if (invalidos && invalidos.length > 0) {
      let produtos: string;
      invalidos.forEach(f => {
        produtos = produtos && produtos.length > 0 ? `${produtos}, ${f.produtoDto.produto}` : f.produtoDto.produto;
      });
      if (produtos && produtos.length > 0) {
        produtos = invalidos.length > 1 ? `Os produtos ${produtos} excedem o máximo de caracteres!` : `O produto ${produtos} execede o máximo de caracteres!`;
        this.alertaService.mostrarMensagem(produtos);
        return;
      }
    }
    let validaQtdeItensDesmembrados: boolean = true;
    if (selecionados && selecionados.length > 0) {
      let qtdeItens: number = this.novoOrcamentoService.listaProdutosDesmembrados.length;
      selecionados.forEach(p => {
        let itemExiste = this.novoOrcamentoService.listaProdutosQtdeApoio.filter(x => x.produto == p.produtoDto.produto);
        if(itemExiste.length > 0){
          itemExiste[0].qtde = itemExiste[0].qtde + p.qtde;
        }else{
          this.novoOrcamentoService.listaProdutosQtdeApoio.push({produto: p.produtoDto.produto, qtde : p.qtde});
        }

        if (p.Filhos.length > 0) {
          p.Filhos.forEach(x => {
            let filhoteExiste = this.novoOrcamentoService.listaProdutosDesmembrados.filter(e => e.produto == x.produto);
            if (filhoteExiste.length > 0) {
              let qtdeAdicionar = p.qtde * x.qtde;
              filhoteExiste[0].qtde = filhoteExiste[0].qtde + qtdeAdicionar;
            }
            else {
              let novo = new ProdutoOrcamentoDto();
              novo.produto = x.produto;
              novo.qtde = p.qtde * x.qtde;
              this.novoOrcamentoService.listaProdutosDesmembrados.push(novo);
              qtdeItens++;
            }
          });
        }
        else {
          let simplesExiste = this.novoOrcamentoService.listaProdutosDesmembrados.filter(e => e.produto == p.produtoDto.produto);
          if (simplesExiste.length > 0) {
            simplesExiste[0].qtde = simplesExiste[0].qtde + p.qtde;
          }
          else {
            let novo = new ProdutoOrcamentoDto();
            novo.produto = p.produtoDto.produto;
            novo.qtde = p.qtde * p.qtde;
            this.novoOrcamentoService.listaProdutosDesmembrados.push(novo);
            qtdeItens++;
          }
        }
        if (this.novoOrcamentoService.listaProdutosDesmembrados.length > this.novoOrcamentoService.limiteQtdeProdutoOpcao) {
          this.novoOrcamentoService.listaProdutosDesmembrados.splice(this.novoOrcamentoService.listaProdutosDesmembrados.length - qtdeItens, qtdeItens);
          this.mensagemService.showWarnViaToast("A quantidade de itens excede a quantidade máxima de itens permitida por opção!");
          validaQtdeItensDesmembrados = false;
          return;
        }
      });

      if(!validaQtdeItensDesmembrados) return;

      this.option.contentStyle(this.selecionados);

      this.limparListaTela();

      return;
    }

    let msg: string[] = new Array();
    msg.push("Por favor, selecione um produto!");
    this.mensagemService.showErrorViaToast(msg);
  }

  limparListaTela() {
    this.selecionados.forEach(x => {
      let linha = document.getElementById(`linha_tabela_${x.produtoDto.produto}`) as HTMLElement;
      linha.classList.remove("p-highlight");
      ((linha.children[1].children[0].children[0].children[1]) as HTMLInputElement).value = "0";
    });

    this.prodsTela.forEach(x => {
      x.qtde = 0;
    });

    this.selecionados = new Array<ProdutoTela>();
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

    produto.qtdeValida = this.verificarQtdeItem(produto, produto.qtde);
    if (!produto.qtdeValida) linha.classList.remove("p-highlight");

    let selecionado = this.selecionados.filter(x => x.produtoDto.produto == produto.produtoDto.produto)[0];
    if (!selecionado) {
      this.selecionados.push(produto);
    }
  }

  subtrairQtde(produto: ProdutoTela, index: number) {

    if (!this.selecionados) return;
    if (produto.qtde == 0) return;

    let linha = document.getElementById(`linha_tabela_${produto.produtoDto.produto}`) as HTMLElement;
    if ((produto.qtde - 1) == 0) {
      //desmarcar
      linha.classList.remove("p-highlight");
      this.selecionados = this.selecionados.filter(x => x.produtoDto.produto != produto.produtoDto.produto);
    }

    produto.qtde--;
    produto.qtdeValida = this.verificarQtdeItem(produto, produto.qtde);
    if (produto.qtdeValida && produto.qtde > 0) {
      linha.classList.add("p-highlight");
    }
  }

  verificarQtdeItem(produto: ProdutoTela, qtde: number) {
    let itemQtde = document.getElementById(`qtde_${produto.produtoDto.produto}`) as HTMLElement;
    if (qtde > this.novoOrcamentoService.constantes.QTDE_MAX_ITENS_CRIACAO_ORCAMENTO) {
      console.log(qtde);
      itemQtde.classList.add("ng-dirty");
      itemQtde.classList.add("ng-invalid");
      itemQtde.classList.add("ng-touched");
      // this.validaQtde = false;
      return false;
    }
    else {
      itemQtde.classList.remove("ng-dirty");
      itemQtde.classList.remove("ng-invalid");
      itemQtde.classList.remove("ng-touched");
      // this.validaQtde = true;
    }
    return true;
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

    produto.qtdeValida = this.verificarQtdeItem(produto, Number.parseInt(v));
    if (!produto.qtdeValida) linha.classList.remove("p-highlight");

    v = v
    produto.qtde = Number.parseInt(v);
    ((e.target) as HTMLInputElement).value = v;
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.which == 13) {
      let el = (event.srcElement) as HTMLElement;
      if (el.classList.contains("p-multiselect-item")) return;
      if (el.getAttribute("id") != "produto" && el.getAttribute("id") != "pesquisar") return;
      if (el.getAttribute("id") == "produto") {
        let input = (event.target) as HTMLInputElement;
        if (!input.value) return;
      }

      this.pesquisar();
      event.cancelBubble = true;
      event.stopPropagation();
      event.preventDefault();//esse cara que fez a diferença
      event.stopImmediatePropagation();
    }
  }

  fechar() {

    let validos = this.selecionados.filter(x => x.qtdeValida);
    if (this.selecionados && this.selecionados.length > 0 && validos && validos.length > 0) {
      this.sweetAlertService.dialogo("", "Os itens selecionados não foram adicionados.<br> Pretende continuar?").subscribe((r) => {
        if (!r) {
          return;
        }
        else {
          this.selecionados = new Array<ProdutoTela>();
          this.ref.close();
        }
      });
    } else {
      this.ref.close();
    }
  }


}
