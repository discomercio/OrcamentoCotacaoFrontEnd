import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { ProdutoCatalogoPropriedadeOpcao } from 'src/app/dto/produtos-catalogo/ProdutoCatalogoPropriedadeOpcao';
import { ProdutoTabela } from 'src/app/dto/produtos-catalogo/ProdutoTabela';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-select-evap-dialog',
  templateUrl: './select-evap-dialog.component.html',
  styleUrls: ['./select-evap-dialog.component.scss']
})
export class SelectEvapDialogComponent implements OnInit {

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public readonly mensagemService: MensagemService,
    telaDesktopService: TelaDesktopService) {
  }

  @ViewChild('dataTable') table: Table;
  stringUtils = StringUtils;
  evaporadorasPassadas: ProdutoTabela[];
  evaporadoras: ProdutoTabela[];
  evaporadoraSelecionada: ProdutoTabela;
  lstOpcoes: ProdutoCatalogoPropriedadeOpcao[];
  lstVoltagens: SelectItem[] = [];
  lstDescargas: SelectItem[] = [];
  lstBtus: SelectItem[] = [];
  lstLinhaProdutos: SelectItem[] = [];

  linhaProduto: string;
  descarga: string;
  voltagem: string;
  btu: string;

  ngOnInit(): void {
    this.evaporadorasPassadas = this.option.data.evaps;
    this.lstOpcoes = this.option.data.opcoes;
    this.evaporadoras = this.evaporadorasPassadas;
    this.buscarLinhaProdutos();
    this.buscarBtus();
  }

  addProduto() {
    if (this.evaporadoraSelecionada) {
      this.ref.close(this.evaporadoraSelecionada);
    }
    return;
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

  filtrarEvaporadoras() {
    this.linhaProduto;
    this.btu;

    let evaporadorasFiltradas: ProdutoTabela[] = this.evaporadorasPassadas;

    if (this.linhaProduto) evaporadorasFiltradas = evaporadorasFiltradas.filter(x => x.linhaBusca.includes("|" + this.linhaProduto + "|"));
    if (this.btu) evaporadorasFiltradas = evaporadorasFiltradas.filter(x => x.linhaBusca.includes("|" +this.btu+ "|"));

    this.evaporadoras = evaporadorasFiltradas;
  }

  marcarLinha(e: Event) {
    e.stopImmediatePropagation();
  }
}
