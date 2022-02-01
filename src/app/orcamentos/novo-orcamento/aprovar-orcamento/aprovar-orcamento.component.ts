import { Component, OnInit, Input } from '@angular/core';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    private readonly sweetalertService: SweetalertService,
    private readonly activedRoute: ActivatedRoute,
    private location: Location) {
    super(telaDesktopService);
  }

  ngOnInit(): void {
    this.activedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
      console.log(this.desabiltarBotoes);
    });
    this.buscarOrcamento(1453);
    this.buscarOpcoesOrcamento(1453);
  }

  @Input() desabiltarBotoes: boolean;

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;

  buscarOrcamento(id: number) {
    this.novoOrcamentoService.criarNovo();
    this.orcamentoService.buscarOrcamento(id.toString()).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = r;
      }
    });
  }

  buscarOpcoesOrcamento(id: number) {
    this.orcamentoOpcaoService.buscarOpcoesOrcamento(id.toString()).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
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
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  aprovar(orcamento) {
    debugger;
    if (!this.opcaoPagto) {
    }
    this.sweetalertService.confirmarAprovacao("Deseja aprovar essa opção?", "").subscribe(result => {
      console.log(result);

    });
  }

  voltar(){
      this.location.back();
  }

}
