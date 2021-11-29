import { Component, OnInit } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-cadastro-orcamento',
  templateUrl: './cadastro-orcamento.component.html',
  styleUrls: ['./cadastro-orcamento.component.scss']
})
export class CadastroOrcamentoComponent implements OnInit {

  constructor(public readonly novoOrcamentoService: NovoOrcamentoService) { }


  labelCliente: string;
labelOpcoesOrcamento:string;

  ngOnInit(): void {
    if (!this.novoOrcamentoService.onResize()){
      this.labelCliente = "Dados do cliente"; 
      this.labelOpcoesOrcamento = "Opções de orçamento";
    }      
      else{
        this.labelCliente = ""; 
        this.labelOpcoesOrcamento = "";
      } 
  }

}
