import { Component, OnInit } from '@angular/core';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  styleUrls: ['./itens.component.scss']
})
export class ItensComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public readonly novoOrcamentoService: NovoOrcamentoService) { }

  public form: FormGroup;
  ngOnInit(): void {
    console.log(this.novoOrcamentoService.orcamentoCotacaoDto);
    this.criarForm();
  }

  criarForm(){
    this.form = this.fb.group({});
  }
}
