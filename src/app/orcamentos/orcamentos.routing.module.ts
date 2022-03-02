import { AppMainComponent } from 'src/app/app.main.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrcamentosListarComponent } from './listar/listar.component';
import { NovoOrcamentoComponent } from './novo-orcamento/novo-orcamento.component';
import { CadastrarClienteComponent } from './novo-orcamento/cadastrar-cliente/cadastrar-cliente.component';
import { ItensComponent } from './novo-orcamento/itens/itens.component';
import { SelectProdDialogComponent } from './novo-orcamento/select-prod-dialog/select-prod-dialog.component';
import { VisualizarOrcamentoComponent } from './novo-orcamento/visualizar-orcamento/visualizar-orcamento.component';
import { AprovarOrcamentoComponent } from './novo-orcamento/aprovar-orcamento/aprovar-orcamento.component';

const OrcamentoRoutingModule: Routes = [
    {
        path: '', component: AppMainComponent, children: [
            {
                path: "orcamentos", component: NovoOrcamentoComponent, children: [
                    { path: "listar/:filtro", component: OrcamentosListarComponent },
                    { path: "cadastrar-cliente", component: CadastrarClienteComponent },
                    { path: "itens", component: ItensComponent },
                    { path: "select-prod", component: SelectProdDialogComponent },
                    { path: "visualizar-orcamento", component: VisualizarOrcamentoComponent},
                    { path: "novo-orcamento", component: NovoOrcamentoComponent },
                    { path: "novo-orcamento/aprovar-orcamento", component: AprovarOrcamentoComponent }
                ]
            }
        ]
    }
]
@NgModule({
    imports: [RouterModule.forChild(OrcamentoRoutingModule)],
    exports: [RouterModule]
})
export class OrcamentosRoutingModule { }