import { Component, OnInit } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';

@Component({
  selector: 'app-teste-orcamento',
  templateUrl: './teste-orcamento.component.html',
  styleUrls: ['./teste-orcamento.component.scss']
})
export class TesteOrcamentoComponent implements OnInit {

  constructor(public readonly novoOrcamentoService: NovoOrcamentoService) { }

  ngOnInit(): void {
  }

}
