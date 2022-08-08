import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-novo-prepedido',
  templateUrl: './novo-prepedido.component.html',
  styleUrls: ['./novo-prepedido.component.scss']
})
export class NovoPrepedidoComponent implements OnInit {

  /*
  fluxo da criação do prepedido:
  selecionar-cliente
  se não existir: cadastrar-cliente
  confirmar-cliente
    que usa o confirmar-endereco
  nesse momento os dados são salvos no novo-prepedido-dados.service

  itens
    que usa o selec-prod-dialog
  
  observacoes
  
  dados-pagto

  confirmar-prepedido
  
  */


  constructor() { }

  ngOnInit() {
  }

}
