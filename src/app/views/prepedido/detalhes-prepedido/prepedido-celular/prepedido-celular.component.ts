import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PedidoCelularComponent } from '../pedido-celular/pedido-celular.component';

@Component({
  selector: 'app-prepedido-celular',
  templateUrl: './prepedido-celular.component.html',
  styleUrls: ['./prepedido-celular.component.scss']
})
export class PrepedidoCelularComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }
  @ViewChild("divprincipal", { static: true }) divprincipal: ElementRef;
  ngAfterViewInit() {
    PedidoCelularComponent.redimensionarTela(this.divprincipal);
  }
 
}
