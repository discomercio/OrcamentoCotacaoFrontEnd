import { UsuarioMeusdadosComponent } from '../../views/usuarios/usuario-meusdados/usuario-meusdados.component';
import { ClienteComponent } from '../../views/cliente/cliente.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from '../../demo/view/dashboarddemo.component';
import { DownloadsComponent } from '../../views/downloads/downloads.component';

import { AppMainComponent } from '../app.main.component';
import { UsuarioEdicaoComponent } from '../../views/usuarios/usuario-edicao/usuario-edicao.component';
import { UsuarioListaComponent } from '../../views/usuarios/usuario-lista/usuario-lista.component';
import { AppComponent } from '../app.component';
import { LoginComponent } from '../../views/login/login.component';

import { ProdutosCatalogoListarComponent } from '../../views/produtos-catalogo/listar/listar.component';
import { ProdutosCatalogoEditarComponent } from '../../views/produtos-catalogo/editar/editar.component';
import { ProdutosCatalogoVisualizarComponent } from '../../views/produtos-catalogo/visualizar/visualizar.component';
import { ProdutosCatalogoCriarComponent } from '../../views/produtos-catalogo/criar/criar.component';

// Propriedades do Catálogo
import { ProdutosCatalogoPropriedadesListarComponent } from '../../views/produtos-catalogo-propriedades/listar/listar.component';
import { ProdutosCatalogoPropriedadesEditarComponent } from '../../views/produtos-catalogo-propriedades/editar/editar.component';
import { ProdutosCatalogoPropriedadesVisualizarComponent } from '../../views/produtos-catalogo-propriedades/visualizar/visualizar.component';
import { ProdutosCatalogoPropriedadesCriarComponent } from '../../views/produtos-catalogo-propriedades/criar/criar.component';

import { AprovarOrcamentoComponent } from '../../views/orcamentos/novo-orcamento/aprovar-orcamento/aprovar-orcamento.component';
import { OrcamentosListarComponent } from '../../views/orcamentos/listar/listar.component';
import { NovoOrcamentoComponent } from '../../views/orcamentos/novo-orcamento/novo-orcamento.component';
import { CadastrarClienteComponent } from 'src/app/views/orcamentos/novo-orcamento/cadastrar-cliente/cadastrar-cliente.component';
import { ItensComponent } from 'src/app/views/orcamentos/novo-orcamento/itens/itens.component';
import { SelectProdDialogComponent } from 'src/app/views/orcamentos/novo-orcamento/select-prod-dialog/select-prod-dialog.component';
import { VisualizarOrcamentoComponent } from 'src/app/views/orcamentos/novo-orcamento/visualizar-orcamento/visualizar-orcamento.component';
import { LoginGuard } from 'src/app/service/autenticacao/login.guard';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppComponent,
                children: [
                    { path: 'account/login', component: LoginComponent, },
                    { path: '', component: AppMainComponent, canActivate: [LoginGuard], children: [

                            // Orçamentos
                            {path: 'orcamentos', canActivate: [LoginGuard], children:[
                                { path: "listar/:filtro", canActivate: [LoginGuard], component: OrcamentosListarComponent },
                                { path: "cadastrar-cliente", canActivate: [LoginGuard], component: CadastrarClienteComponent },
                                { path: "itens", canActivate: [LoginGuard], component: ItensComponent },
                                { path: "select-prod", canActivate: [LoginGuard], component: SelectProdDialogComponent },
                                { path: "visualizar-orcamento", canActivate: [LoginGuard], component: VisualizarOrcamentoComponent},
                                { path: "novo-orcamento", canActivate: [LoginGuard], component: NovoOrcamentoComponent },
                                { path: "novo-orcamento/aprovar-orcamento", canActivate: [LoginGuard], component: AprovarOrcamentoComponent },
                            ]},

                            // Dashboard
                            { path: 'dashboards/generic', canActivate: [LoginGuard], component: DashboardDemoComponent },

                            // Produtos Catalogo
                            { path: 'produtos-catalogo', canActivate: [LoginGuard], children:[
                                { path: 'criar', canActivate: [LoginGuard], component: ProdutosCatalogoCriarComponent },
                                { path: 'listar', canActivate: [LoginGuard], component: ProdutosCatalogoListarComponent },
                                { path: 'visualizar/:id', canActivate: [LoginGuard], component: ProdutosCatalogoVisualizarComponent },
                                { path: 'editar/:id', canActivate: [LoginGuard], component: ProdutosCatalogoEditarComponent },
                            ]},

                            // Propriedades do Produto
                            { path: 'produtos-catalogo-propriedades', canActivate: [LoginGuard], children:[
                                { path: 'criar', canActivate: [LoginGuard], component: ProdutosCatalogoPropriedadesCriarComponent },
                                { path: 'listar', canActivate: [LoginGuard], component: ProdutosCatalogoPropriedadesListarComponent },
                                { path: 'visualizar/:id', canActivate: [LoginGuard], component: ProdutosCatalogoPropriedadesVisualizarComponent },
                                { path: 'editar/:id', canActivate: [LoginGuard], component: ProdutosCatalogoPropriedadesEditarComponent },
                            ]},

                            // Downloads
                            { path: 'downloads', component: DownloadsComponent, canActivate: [LoginGuard] },
                            
                            // Usuarios
                            { path: 'usuarios', canActivate: [LoginGuard], children:[
                                { path: 'usuario-lista', component: UsuarioListaComponent, canActivate: [LoginGuard] },
                                { path: 'usuario-edicao/:apelido', component: UsuarioEdicaoComponent, canActivate: [LoginGuard] },
                                { path: 'usuario-meusdados', component: UsuarioMeusdadosComponent, canActivate: [LoginGuard] },
                            ]},

                            // Clientes
                            { path: 'cliente/cliente', component: ClienteComponent, canActivate: [LoginGuard] }
                        ]
                    }
                ]
            },
            // { path: 'dashboards/generic', component: DashboardDemoComponent },
        ], { scrollPositionRestoration: 'enabled' },
        )
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
