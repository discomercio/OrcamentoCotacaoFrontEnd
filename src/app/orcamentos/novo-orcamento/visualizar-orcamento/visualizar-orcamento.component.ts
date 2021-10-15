import { Component, OnInit } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Component({
  selector: 'app-visualizar-orcamento',
  templateUrl: './visualizar-orcamento.component.html',
  styleUrls: ['./visualizar-orcamento.component.scss']
})
export class VisualizarOrcamentoComponent implements OnInit {

  constructor(public readonly novoOrcamentoService: NovoOrcamentoService) { }

  ngOnInit(): void {
  }

  desconto: number = 3;
  moedaUtils: MoedaUtils = new MoedaUtils();
  opcaoPagto: boolean;
}
