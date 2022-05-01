import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.component.html',
  styleUrls: ['./novo-pedido.component.scss']
})
export class NovoPedidoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  itemPayment:any;
}
