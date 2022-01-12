import { Component, OnInit, HostListener } from '@angular/core';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService) { 
      super(telaDesktopService);
    }

  ngOnInit(): void {
    this.buscarOrcamento(1433);
  }

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();

  buscarOrcamento(id: number) {
    this.orcamentoService.buscarOrcamento(id.toString()).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = r;
        // this.opcoesOrcamento = r[0];
      }
    });
  }

  somarRA(orcamento: OrcamentoOpcaoDto): string {
    let retorno: string;
    let total = orcamento.VlTotal;
    let totalRa = orcamento.ValorTotalComRA;
    // vou formatar  aqui antes de passar para a tela
    let valor_ra = this.moedaUtils.formatarDecimal(totalRa - total);
    if (valor_ra > 0)
      retorno = this.moedaUtils.formatarMoedaSemPrefixo(valor_ra);
    else
      retorno = this.moedaUtils.formatarValorDuasCasaReturnZero(valor_ra);

    return retorno;
  }

  activeState: boolean[] = [false, false, false];
  toggle(index: number) {
    if(this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

}
