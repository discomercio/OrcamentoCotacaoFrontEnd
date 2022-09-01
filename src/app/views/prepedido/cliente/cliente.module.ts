import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClienteRoutingModule } from './cliente-routing.module';
import { ClienteComponent2 } from './cliente/cliente.component';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { ClienteCorpoModule } from './cliente-corpo/cliente-corpo.module';


@NgModule({
  declarations: [ClienteComponent2],
  imports: [
    CommonModule,
    ClienteCorpoModule,
    ClienteRoutingModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ClienteModule { }
