import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule, MatButtonModule, MatCardModule, 
  MatRadioModule, MatAutocompleteModule, MatCheckbox, MatCheckboxModule, MatTableModule, 
  MatSnackBarModule, MatSelectModule, MatStepperModule, MatDialogModule, 
  MatPaginatorModule, MatSlideToggleModule, MatFormFieldModule, MatExpansionModule } from '@angular/material';
  import { FlexLayoutModule } from '@angular/flex-layout';
  import { TextMaskModule } from 'angular2-text-mask';

import { NovoPrepedidoComponent } from './novo-prepedido.component';
import { SelecionarClienteComponent } from './selecionar-cliente/selecionar-cliente.component';
import { PrePedidoConfirmarClienteComponent } from './confirmar-cliente/prepedidoconfirmar-cliente.component';
import { NovoPrepedidoRoutingModule } from './novo-prepedido-routing.module';
import { PrePedidoCadastrarClienteComponent } from './cadastrar-cliente/prepedidocadastrar-cliente.component';
import { ConfirmarEnderecoComponent } from './confirmar-endereco/confirmar-endereco.component';
import { PrePedidoItensComponent } from './itens/prepedidoitens.component';
import { SelecProdDialogComponent } from './selec-prod-dialog/selec-prod-dialog.component';
import { DadosPagtoComponent } from './dados-pagto/dados-pagto.component';
import { ConfirmarPrepedidoComponent } from './confirmar-prepedido/confirmar-prepedido.component';
import { PrePedidoObservacoesComponent } from './observacoes/prepedidoobservacoes.component';
import { ClienteCorpoModule } from '../cliente/cliente-corpo/cliente-corpo.module';
import { CepModule } from '../cliente/cep/cep.module';
import { AutofocusDirective } from 'src/app/utilities/AutofocusDirective';


@NgModule({
  declarations: [NovoPrepedidoComponent,
    SelecionarClienteComponent, PrePedidoConfirmarClienteComponent, PrePedidoCadastrarClienteComponent,
    ConfirmarEnderecoComponent, PrePedidoItensComponent,
    SelecProdDialogComponent,
    DadosPagtoComponent,
    ConfirmarPrepedidoComponent,AutofocusDirective,
    PrePedidoObservacoesComponent],
  imports: [
    CommonModule,
    ClienteCorpoModule,
    CepModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    FlexLayoutModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSnackBarModule,
    MatSelectModule,
    MatStepperModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TextMaskModule,
    NovoPrepedidoRoutingModule,
    MatExpansionModule
  ],
  exports: [],
  entryComponents: [
    SelecProdDialogComponent
  ]
})
export class NovoPrepedidoModule { }
