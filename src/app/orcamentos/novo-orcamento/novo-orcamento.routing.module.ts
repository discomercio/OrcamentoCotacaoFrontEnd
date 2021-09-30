import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NovoOrcamentoComponent } from './novo-orcamento.component';
import { CadastrarClienteComponent } from './cadastrar-cliente/cadastrar-cliente.component';
import { AppMainComponent } from 'src/app/app.main.component';
import { ItensComponent } from './itens/itens.component';

const novoOrcamentoRoutes: Routes = [
    {
        path: '', component: AppMainComponent, children: [
            {
                path: "novo-orcamento", component: NovoOrcamentoComponent, children: [
                    { path: "cadastrar-cliente", component: CadastrarClienteComponent },
                    { path: "itens", component: ItensComponent }
                ]
            }
        ]
    }
]
@NgModule({
    imports: [RouterModule.forChild(novoOrcamentoRoutes)],
    exports: [RouterModule]
})
export class NovoOrcamentoRoutingModule { }