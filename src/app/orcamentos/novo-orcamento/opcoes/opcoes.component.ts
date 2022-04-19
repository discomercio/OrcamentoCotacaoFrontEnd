import { Component, OnInit } from '@angular/core';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ItensComponent } from '../itens/itens.component';
import { NovoOrcamentoService } from '../novo-orcamento.service';

@Component({
  selector: 'app-opcoes',
  templateUrl: './opcoes.component.html',
  styleUrls: ['./opcoes.component.scss']
})
export class OpcoesComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(public readonly novoOrcamentoService: NovoOrcamentoService,
    public readonly itensComponent: ItensComponent,
    telaDesktopService: TelaDesktopService) {
    super(telaDesktopService);
  }

  stringUtils = StringUtils;
  ngOnInit(): void {

  }
}
