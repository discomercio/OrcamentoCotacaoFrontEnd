import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
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
  evaporadoraSelecionada:ProdutoTabela;

  ngOnInit(): void {
    this.evaporadorasPassadas = this.option.data;
    this.evaporadoras = this.evaporadorasPassadas;
  }

  addProduto(){
    if (this.evaporadoraSelecionada){
      this.ref.close(this.evaporadoraSelecionada);
    }
    return;
  }

  marcarLinha(e: Event) {
    e.stopImmediatePropagation();
  }
}
