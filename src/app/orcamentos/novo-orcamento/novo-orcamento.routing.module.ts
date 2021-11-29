import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NovoOrcamentoComponent } from './novo-orcamento.component';
import { CadastrarClienteComponent } from './cadastrar-cliente/cadastrar-cliente.component';
import { AppMainComponent } from 'src/app/app.main.component';
import { ItensComponent } from './itens/itens.component';
import { SelectProdDialogComponent } from './select-prod-dialog/select-prod-dialog.component';
import { VisualizarOrcamentoComponent } from './visualizar-orcamento/visualizar-orcamento.component';
import { CadastroOrcamentoComponent } from './cadastro-orcamento/cadastro-orcamento.component';

const novoOrcamentoRoutes: Routes = [
    {
        path: '', component: AppMainComponent, children: [
            {
                path: "novo-orcamento", component: NovoOrcamentoComponent, children: [
                    { path: "cadastrar-cliente", component: CadastrarClienteComponent },
                    { path: "itens", component: ItensComponent },
                    { path: "select-prod", component: SelectProdDialogComponent },
                    { path:"visualizar-orcamento", component: VisualizarOrcamentoComponent},
                    { path:"cadastro-orcamento", component: CadastroOrcamentoComponent},
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