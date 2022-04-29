import { Component, OnInit } from '@angular/core';
//import {InputTextareaModule} from 'primeng/inputtextarea';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  constructor() { }

    ngOnInit(): void {
    }

    exibirTipo : boolean = true;

    tipoPessoaSelPF()
    {
    this.exibirTipo = true;
    }

    tipoPessoaSelPJ()
    {
    this.exibirTipo = false;
    }

    inserirCliente() {
    }
}
