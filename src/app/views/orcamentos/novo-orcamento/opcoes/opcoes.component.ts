import { Component, OnInit } from '@angular/core';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
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
    telaDesktopService: TelaDesktopService,
    public readonly mensagemService:MensagemService) {
    super(telaDesktopService);
  }

  stringUtils = StringUtils;
  ngOnInit(): void {

  }

  removerOpcao(index: number) {
    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.splice(index, 1);
    this.mensagemService.showSuccessViaToast("Opção de orçamento removida com sucesso!");
  }
}
