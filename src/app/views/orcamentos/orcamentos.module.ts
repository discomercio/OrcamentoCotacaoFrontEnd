import { SharedModule } from './../../main/shared.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { NgxMaskModule } from 'ngx-mask';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GalleriaModule } from 'primeng/galleria';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { DialogService } from 'primeng/dynamicdialog';

// import { OrcamentosRoutingModule } from '../../main/routing/orcamentos.routing.module';
import { OrcamentosListarComponent } from './listar/listar.component';
import { AprovarOrcamentoComponent } from './novo-orcamento/aprovar-orcamento/aprovar-orcamento.component';
import { CadastrarClienteComponent } from './novo-orcamento/cadastrar-cliente/cadastrar-cliente.component';
import { ItensComponent } from './novo-orcamento/itens/itens.component';
import { VisualizarOrcamentoComponent } from './novo-orcamento/visualizar-orcamento/visualizar-orcamento.component';
import { NovoOrcamentoComponent } from './novo-orcamento/novo-orcamento.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormaPagtoComponent } from './novo-orcamento/forma-pagto/forma-pagto.component';
import { OpcoesComponent } from './novo-orcamento/opcoes/opcoes.component';
import { EditarOpcaoComponent } from './editar/editar-opcao/editar-opcao.component';
import { EditarClienteComponent } from './editar/editar-cliente/editar-cliente.component';
import { SelectProdDialogComponent } from './novo-orcamento/select-prod-dialog/select-prod-dialog.component';
import { SelectCloneOpcoesDialogComponent } from './novo-orcamento/select-clone-opcoes-dialog/select-clone-opcoes-dialog.component';
import { BuscaComponent } from './novo-orcamento/cliente/busca/busca.component';
import { AprovarClienteOrcamentoComponent } from './novo-orcamento/cliente/aprovar-cliente-orcamento/aprovar-cliente-orcamento.component';

@NgModule({
  declarations: [
    OrcamentosListarComponent,
    AprovarOrcamentoComponent,
    CadastrarClienteComponent,
    ItensComponent,
    SelectProdDialogComponent,
    VisualizarOrcamentoComponent,
    NovoOrcamentoComponent,
    FormaPagtoComponent,
    OpcoesComponent,
    EditarOpcaoComponent,
    EditarClienteComponent,
    SelectCloneOpcoesDialogComponent,
    BuscaComponent,
    AprovarClienteOrcamentoComponent
  ],
  imports: [
    SharedModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    NgxMaskModule.forRoot(),
    DividerModule,
    TableModule,
    InputTextareaModule,
    PaginatorModule,
    AvatarModule,
    TooltipModule,
    RadioButtonModule,
    GalleriaModule,
    CalendarModule,
    TabViewModule,
    AutoCompleteModule,
    MultiSelectModule,
    InputSwitchModule,
  ],
  providers:[DialogService, DatePipe]
})
export class OrcamentosModule { }
