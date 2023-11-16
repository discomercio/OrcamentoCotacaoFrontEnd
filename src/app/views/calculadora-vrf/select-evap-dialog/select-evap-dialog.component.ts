import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { Constantes } from 'src/app/utilities/constantes';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-select-evap-dialog',
  templateUrl: './select-evap-dialog.component.html',
  styleUrls: ['./select-evap-dialog.component.scss']
})
export class SelectEvapDialogComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private readonly alertaService: AlertaService,
    private readonly mensagemService: MensagemService,
    private readonly sweetAlertService: SweetalertService,
    telaDesktopService: TelaDesktopService,
  ) {
    super(telaDesktopService)
  }

  @ViewChild('dataTable') table: Table;
  stringUtils = StringUtils;
  evaporadorasPassadas: ProdutoTabela[];
  evaporadorasFiltradas: ProdutoTabela[];
  lstOpcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstBtus: SelectItem[] = [];
  lstLinhaProdutos: SelectItem[] = [];
  lstKcals: SelectItem[] = [];
  moedaUtils = new MoedaUtils();
  linhaProdutos: string[] = new Array();
  descarga: string;
  voltagem: string;
  btus: string[] = new Array();
  kcals: string[] = new Array();
  constantes = new Constantes();
  selecionados: Array<ProdutoTabela> = new Array<ProdutoTabela>();

  ngOnInit(): void {
    this.evaporadorasPassadas = this.option.data.evaps;
    if (this.evaporadorasPassadas && this.evaporadorasPassadas.length > 0) {
      this.evaporadorasPassadas.forEach(x => {
        x.qtde = 0;
      })
    }
    this.lstOpcoes = this.option.data.opcoes;
    this.buscarLinhaProdutos();
    this.buscarBtus();
    this.buscarKcals();
  }

  buscarKcals() {
    let kcals = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 10);
    kcals.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstKcals.push(opcao);
    });
  }

  buscarBtus() {
    let btus = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 5)

    btus.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstBtus.push(opcao);
    });
  }

  buscarLinhaProdutos() {
    let linhas = this.lstOpcoes.filter(x => Number.parseInt(x.id_produto_catalogo_propriedade) == 8)

    linhas.forEach(x => {
      let opcao: SelectItem = { title: x.valor, value: x.id, label: x.valor };
      this.lstLinhaProdutos.push(opcao);
    });
  }

  pesquisar() {

    if (this.selecionados && this.selecionados.length > 0) {
      this.sweetAlertService.dialogo("", "Os itens selecionados não foram adicionados.<br> Pretende continuar?").subscribe((r) => {
        if (!r) {
          return;
        }
        else {
          this.selecionados = new Array<ProdutoTabela>();
          this.buscarProdutos();
          return;
        }
      });
    } else {
      this.buscarProdutos();
    }

  }

  buscarProdutos() {
    let evaporadorasFiltradas: ProdutoTabela[] = JSON.parse(JSON.stringify(this.evaporadorasPassadas));

    if (this.linhaProdutos.length == 0 && this.btus.length == 0 && this.kcals.length == 0) {
      this.evaporadorasFiltradas = evaporadorasFiltradas;
      return
    }

    let listaLinhaProduto = this.filtrarPorLinhaProduto(evaporadorasFiltradas);
    let listaBtu = this.filtrarPorBtu(listaLinhaProduto);
    let listaKcal = this.filtrarPorKcal(listaBtu);

    this.evaporadorasFiltradas = listaKcal.sort((a, b) => a.produto.localeCompare(b.produto));
  }

  filtrarPorLinhaProduto(lista: ProdutoTabela[]) {
    let retorno: ProdutoTabela[] = new Array<ProdutoTabela>();
    if (this.linhaProdutos.length > 0) {
      this.linhaProdutos.forEach(x => {
        let prop = `|${this.constantes.fProp}${x}|`;
        let evap = lista.filter(x => x.linhaBusca.includes(prop));
        if (evap.length > 0) {
          evap.forEach(e => {
            retorno.push(e);
          });
        }
      });
    } else {
      retorno = lista;
    }

    return retorno;
  }

  filtrarPorBtu(lista: ProdutoTabela[]) {
    let retorno: ProdutoTabela[] = new Array<ProdutoTabela>();
    if (this.btus.length > 0) {
      this.btus.forEach(x => {
        let prop = `|${this.constantes.fProp}${x}|`;
        let evap = lista.filter(x => x.linhaBusca.includes(prop));
        if (evap.length > 0) {
          evap.forEach(e => {
            retorno.push(e);
          });
        }
      });
    }else {
      retorno = lista;
    }

    return retorno;
  }

  filtrarPorKcal(lista: ProdutoTabela[]) {
    let retorno: ProdutoTabela[] = new Array<ProdutoTabela>();
    if (this.kcals.length > 0) {
      this.kcals.forEach(x => {
        let prop = `|${this.constantes.fProp}${x}|`;
        let evap = lista.filter(x => x.linhaBusca.includes(prop));
        if (evap.length > 0) {
          evap.forEach(e => {
            retorno.push(e);
          });
        }
      });
    }else {
      retorno = lista;
    }

    return retorno;
  }

  addQtde(produto: ProdutoTabela) {

    if (!this.selecionados) {
      this.selecionados = new Array<ProdutoTabela>();
    }

    let linha = document.getElementById(`linha_tabela_${produto.produto}`) as HTMLElement;
    linha.classList.add("p-highlight");

    produto.qtde++;

    let selecionado = this.selecionados.filter(x => x.produto == produto.produto)[0];
    if (!selecionado) {
      this.selecionados.push(produto);
    }
  }

  subtrairQtde(produto: ProdutoTabela, index: number) {

    if (!this.selecionados) return;
    if (produto.qtde == 0) return;

    if ((produto.qtde - 1) == 0) {
      //desmarcar
      let linha = document.getElementById(`linha_tabela_${produto.produto}`) as HTMLElement;
      linha.classList.remove("p-highlight");
      this.selecionados = this.selecionados.filter(x => x.produto != produto.produto);
    }

    produto.qtde--;
  }

  formatarQtde(e: Event, produto: ProdutoTabela): void {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    v = valor.replace(/[^0-9]/g, '');
    if (!v) {
      v = 0;
    }

    if (!this.selecionados) {
      this.selecionados = new Array<ProdutoTabela>();
    }

    let linha = document.getElementById(`linha_tabela_${produto.produto}`) as HTMLElement;
    if (v == 0) {
      linha.classList.remove("p-highlight");
      this.selecionados = this.selecionados.filter(x => x.produto != produto.produto);
    }
    else {

      let selecionado = this.selecionados.filter(x => x.produto == produto.produto)[0];
      if (!selecionado) {
        this.selecionados.push(produto);
      }
      linha.classList.add("p-highlight");
    }
    v = v
    produto.qtde = Number.parseInt(v);
    ((e.target) as HTMLInputElement).value = v;
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.which == 13) {
      let el = (event.srcElement) as HTMLElement;
      if (el.getAttribute("id") != "pesquisar" && el.getAttribute("id") != undefined) return;


      this.pesquisar();
      event.cancelBubble = true;
      event.stopPropagation();
      event.preventDefault();//esse cara que fez a diferença
      event.stopImmediatePropagation();
    }
  }

  addProduto() {
    if (this.selecionados && this.selecionados.length > 0) {
      this.option.contentStyle(this.selecionados);

      this.limparListaTela();

      return;
    }
  }

  limparListaTela() {
    this.selecionados.forEach(x => {
      let linha = document.getElementById(`linha_tabela_${x.produto}`) as HTMLElement;
      linha.classList.remove("p-highlight");
      ((linha.children[1].children[1]) as HTMLInputElement).value = "0";
    });

    this.evaporadorasFiltradas.forEach(x => {
      x.qtde = 0;
    });

    this.selecionados = new Array<ProdutoTabela>();
  }

  fechar() {
    if (this.selecionados && this.selecionados.length > 0) {
      this.sweetAlertService.dialogo("", "Os itens selecionados não foram adicionados.<br> Pretende continuar?").subscribe((r) => {
        if (!r) {
          return;
        }
        else {
          this.selecionados = new Array<ProdutoTabela>();
          this.ref.close();
        }
      });
    } else {
      this.ref.close();
    }
  }
}
