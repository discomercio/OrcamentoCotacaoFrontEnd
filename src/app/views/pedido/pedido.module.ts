import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidoRoutingModule } from './pedido-routing.module';
import { ConsultaPedidoComponent } from './consulta-pedido/consulta-pedido.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule, MatButtonModule, MatCardModule, MatRadioModule, MatAutocompleteModule, MatCheckbox, MatCheckboxModule, MatTableModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ListaPedidoComponent } from './lista-pedido/lista-pedido.component';
import { PrepedidoModule } from '../prepedido/prepedido.module';


@NgModule({
  declarations: [ConsultaPedidoComponent, ListaPedidoComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    FlexLayoutModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTableModule,
    ReactiveFormsModule,
    PedidoRoutingModule,
    PrepedidoModule
  ]
})
export class PedidoModule { }

