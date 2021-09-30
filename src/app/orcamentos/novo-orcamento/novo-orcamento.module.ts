import { NgModule } from "@angular/core";
import { NovoOrcamentoComponent } from './novo-orcamento.component';
import { CommonModule } from '@angular/common';
import { CadastrarClienteComponent } from './cadastrar-cliente/cadastrar-cliente.component';
import { NovoOrcamentoRoutingModule } from './novo-orcamento.routing.module';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgxMaskModule } from 'ngx-mask';
import { ReactiveFormsModule } from '@angular/forms';
import { ItensComponent } from './itens/itens.component';
import { DividerModule } from 'primeng/divider';

@NgModule({
    imports:[
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        DropdownModule,
        CheckboxModule,
        NovoOrcamentoRoutingModule,
        ButtonModule,
        NgxMaskModule.forRoot(),
        DividerModule
    ],
    exports:[

    ],
    declarations:[
        NovoOrcamentoComponent,
        CadastrarClienteComponent,
        ItensComponent
    ],
    providers:[]
})
export class NovoOrcamentoModule { }