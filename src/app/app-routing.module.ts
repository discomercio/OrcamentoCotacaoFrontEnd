import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { DownloadsComponent } from './downloads/downloads.component';

import { AppMainComponent } from './app.main.component';
import { UsuarioEdicaoComponent } from './usuarios/usuario-edicao/usuario-edicao.component';
import { UsuarioListaComponent } from './usuarios/usuario-lista/usuario-lista.component';
import { CadastrarClienteComponent } from './orcamentos/novo/cadastrar-cliente/cadastrar-cliente.component';
import { ListaComponent } from './orcamentos/listar-orcamentos/lista/lista.component';
import { ListaProdutosComponent } from './produtos/lista-produtos/lista-produtos.component';
import { VisualizarProdutoComponent } from './produtos/visualizar-produto/visualizar-produto.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: '', component: DashboardDemoComponent },
                    { path: 'dashboards/generic', component: DashboardDemoComponent },
                    { path: 'orcamentos/novo', component: CadastrarClienteComponent },
                    { path: 'orcamentos/listar-orcamentos/lista/:filtro', component: ListaComponent },
                    { path: 'produtos/lista-produtos/lista-produtos', component: ListaProdutosComponent },
                    { path: 'produtos/visualizar-produto/visualizar-produto/:fabricante/:produto', component: VisualizarProdutoComponent },
                    { path: 'downloads', component: DownloadsComponent },
                    { path: 'usuarios/usuario-lista', component: UsuarioListaComponent },
                    { path: 'usuarios/usuario-edicao/:apelido', component: UsuarioEdicaoComponent }
                ]
            },
            { path: 'dashboards/generic', component: DashboardDemoComponent },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
