import { Component, OnInit, HostListener } from '@angular/core';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';

@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent implements OnInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService) { }

  ngOnInit(): void {
    this.buscarOrcamento();
  }

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();

  buscarOrcamento() {
    this.orcamentoService.buscarOrcamento().toPromise().then(r => {
      if (r != null) {
        // this.opcoesOrcamento = r[0];
      }
    });
  }

  somarRA(orcamento: OrcamentoOpcaoDto): string {
    let retorno: string;
    let total = orcamento.VlTotalDestePedido;
    let totalRa = orcamento.ValorTotalDestePedidoComRA;
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
