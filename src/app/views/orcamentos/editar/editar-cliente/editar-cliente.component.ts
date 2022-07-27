import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CadastrarClienteComponent } from '../../novo-orcamento/cadastrar-cliente/cadastrar-cliente.component';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss']
})
export class EditarClienteComponent implements OnInit {

  constructor(private readonly activatedRoute: ActivatedRoute) { }

  @ViewChild("cadastrar-cliente", { static: false }) cadastrarCliente: CadastrarClienteComponent;
  ngOnInit(): void {
    
  }

}
