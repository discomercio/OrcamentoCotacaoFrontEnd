import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClienteRoutingModule } from './cliente-routing.module';
import { ClienteComponent } from './cliente/cliente.component';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { ClienteCorpoModule } from './cliente-corpo/cliente-corpo.module';


@NgModule({
  declarations: [ClienteComponent],
  imports: [
    CommonModule,
    ClienteCorpoModule,
    ClienteRoutingModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ClienteModule { }
