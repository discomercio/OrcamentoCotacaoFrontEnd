import { Component, OnInit, Inject } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Parcelado } from 'src/app/dto/forma-pagto/parcelado';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-visualizar-orcamento',
  templateUrl: './visualizar-orcamento.component.html',
  styleUrls: ['./visualizar-orcamento.component.scss']
})
export class VisualizarOrcamentoComponent implements OnInit {

  constructor(public readonly novoOrcamentoService: NovoOrcamentoService,
    @Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    //calcular o parcelamento
    // this.formatarParcelamento(this.novoOrcamentoService.orcamentoCotacaoDto.ListaOrcamentoCotacaoDto)
  }

  // formatarParcelamento(orcamentoCotacao: OrcamentoCotacaoDto[]) {
  //   if (orcamentoCotacao != undefined && orcamentoCotacao.length > 0) {
  //     orcamentoCotacao.forEach(orcamento => {
  //       orcamento.FormaPagto.forEach(pagto => {
  //         if (pagto.codigo == this.novoOrcamentoService.constantes.COD_PAGTO_PARCELADO) {
  //           for (let i = 0; i < pagto.valores.length; i++) {
  //             let parcela = new Parcelado;
  //             parcela.qtde = i;
  //             parcela.valor = i + 1 + "X " + this.novoOrcamentoService.moedaUtils.formatarMoedaComPrefixo(pagto.valores[i]);
  //             this.parcelamento.push(parcela);

  //           }
  //         }
  //       });
  //     })
  //   }

  // }

  parcelamento: Parcelado[] = new Array();

  moedaUtils: MoedaUtils = new MoedaUtils();
  opcaoPagto: boolean;



}
