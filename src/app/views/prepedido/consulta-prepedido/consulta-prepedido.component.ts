import { Component, OnInit } from '@angular/core';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';

@Component({
  selector: 'app-consulta-prepedido',
  templateUrl: './consulta-prepedido.component.html',
  styleUrls: ['./consulta-prepedido.component.scss']
})
export class ConsultaPrepedidoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(telaDesktopService: TelaDesktopService) {
    super(telaDesktopService);

  }

  ngOnInit() {
  }

}
