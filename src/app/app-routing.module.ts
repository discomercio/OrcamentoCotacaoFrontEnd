import { ClienteComponent } from './cliente/cliente.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { DownloadsComponent } from './downloads/downloads.component';

import { AppMainComponent } from './app.main.component';
import { UsuarioEdicaoComponent } from './usuarios/usuario-edicao/usuario-edicao.component';
import { UsuarioListaComponent } from './usuarios/usuario-lista/usuario-lista.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login/login.component';

import { ProdutosCatalogoListarComponent } from './produtos-catalogo/listar/listar.component';
import { ProdutosCatalogoEditarComponent } from './produtos-catalogo/editar/editar.component';
import { ProdutosCatalogoVisualizarComponent } from './produtos-catalogo/visualizar/visualizar.component';
import { ProdutosCatalogoCriarComponent } from './produtos-catalogo/criar/criar.component';

import { AprovarOrcamentoComponent } from './orcamentos/novo-orcamento/aprovar-orcamento/aprovar-orcamento.component';
import { OrcamentosListarComponent } from './orcamentos/listar/listar.component';
import { NovoOrcamentoComponent } from './orcamentos/novo-orcamento/novo-orcamento.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppComponent,
                children: [
                    { path: 'account/login', component: LoginComponent, },
                    {
                        path: '', component: AppMainComponent, children: [
                            
                            { path: '', component: DashboardDemoComponent, },
                            { path: 'dashboards/generic', component: DashboardDemoComponent },
                            
                            { path: 'produtos-catalogo/criar', component: ProdutosCatalogoCriarComponent },
                            { path: 'produtos-catalogo/listar', component: ProdutosCatalogoListarComponent },
                            { path: 'produtos-catalogo/visualizar/:id', component: ProdutosCatalogoVisualizarComponent },
                            { path: 'produtos-catalogo/editar/:id', component: ProdutosCatalogoEditarComponent },

                            { path: 'downloads', component: DownloadsComponent },
                            
                            { path: 'usuarios/usuario-lista', component: UsuarioListaComponent },
                            { path: 'usuarios/usuario-edicao/:apelido', component: UsuarioEdicaoComponent },
                            { path: 'cliente/cliente', component: ClienteComponent }
                        ]
                    }
                ]
            },
            { path: 'dashboards/generic', component: DashboardDemoComponent },
        ], { scrollPositionRestoration: 'enabled' },
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
