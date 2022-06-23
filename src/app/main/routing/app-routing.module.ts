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
import { ProdutosCatalogoPropriedadesListarComponent } from '../../views/produtos-catalogo/propriedades/listar/listar.component';
import { ProdutosCatalogoPropriedadesEditarComponent } from '../../views/produtos-catalogo/propriedades/editar/editar.component';
import { ProdutosCatalogoPropriedadesVisualizarComponent } from '../../views/produtos-catalogo/propriedades/visualizar/visualizar.component';
import { ProdutosCatalogoPropriedadesCriarComponent } from '../../views/produtos-catalogo/propriedades/criar/criar.component';

import { AprovarOrcamentoComponent } from '../../views/orcamentos/novo-orcamento/aprovar-orcamento/aprovar-orcamento.component';
import { OrcamentosListarComponent } from '../../views/orcamentos/listar/listar.component';
import { NovoOrcamentoComponent } from '../../views/orcamentos/novo-orcamento/novo-orcamento.component';
import { CadastrarClienteComponent } from 'src/app/views/orcamentos/novo-orcamento/cadastrar-cliente/cadastrar-cliente.component';
import { ItensComponent } from 'src/app/views/orcamentos/novo-orcamento/itens/itens.component';
import { SelectProdDialogComponent } from 'src/app/views/orcamentos/novo-orcamento/select-prod-dialog/select-prod-dialog.component';
import { VisualizarOrcamentoComponent } from 'src/app/views/orcamentos/novo-orcamento/visualizar-orcamento/visualizar-orcamento.component';
import { ProdutosCatalogoConsultarComponent } from 'src/app/views/produtos-catalogo/consultar/consultar.component';
import { NovoPedidoComponent } from 'src/app/views/pedido/novo-pedido/novo-pedido.component';
import { AprovacaoOrcamentoClienteComponent } from 'src/app/views/orcamentos/aprovacao-orcamento-cliente/aprovacao-orcamento-cliente.component';
import { AuthGuard } from '../guards/auth.guard';
import { PublicoOrcamentoComponent } from 'src/app/views/publico/orcamento/orcamento.component';
import { CalculadoraVrfComponent } from 'src/app/views/calculadora-vrf/calculadora-vrf.component';
import { SelectEvapDialogComponent } from 'src/app/views/calculadora-vrf/select-evap-dialog/select-evap-dialog.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppComponent,
                children: [
                    { path: 'account/login', component: LoginComponent, },
                    { path: 'orcamentos/aprovacao-orcamento-cliente', component: AprovacaoOrcamentoClienteComponent },
                    { path: 'publico/orcamento/:guid', component: PublicoOrcamentoComponent },
                    {
                        path: '', component: AppMainComponent, canActivate: [AuthGuard], children: [

                            // Orçamentos
                            {
                                path: 'orcamentos', canActivate: [AuthGuard], children: [
                                    { path: "listar/:filtro", canActivate: [AuthGuard], component: OrcamentosListarComponent },
                                    { path: "cadastrar-cliente/:filtro", canActivate: [AuthGuard], component: CadastrarClienteComponent },
                                    { path: "itens", canActivate: [AuthGuard], component: ItensComponent },
                                    { path: "select-prod", canActivate: [AuthGuard], component: SelectProdDialogComponent },
                                    { path: "visualizar-orcamento/:id", canActivate: [AuthGuard], component: VisualizarOrcamentoComponent },
                                    { path: "novo-orcamento", canActivate: [AuthGuard], component: NovoOrcamentoComponent },
                                    { path: "aprovar-orcamento/:id", canActivate: [AuthGuard], component: AprovarOrcamentoComponent },
                                ]
                            },

                            // Dashboard
                            { path: 'dashboards/generic', canActivate: [AuthGuard], component: DashboardDemoComponent },

                            {
                                path: 'pedido', canActivate: [AuthGuard], children: [
                                    { path: 'novo-pedido', canActivate: [AuthGuard], component: NovoPedidoComponent },
                                ]
                            },
                            // Produtos Catalogo
                            {
                                path: 'produtos-catalogo', canActivate: [AuthGuard], children: [
                                    { path: 'consultar', canActivate: [AuthGuard], component: ProdutosCatalogoConsultarComponent },
                                    { path: 'criar', canActivate: [AuthGuard], component: ProdutosCatalogoCriarComponent },
                                    { path: 'listar', canActivate: [AuthGuard], component: ProdutosCatalogoListarComponent },
                                    { path: 'visualizar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoVisualizarComponent },
                                    { path: 'editar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoEditarComponent },
                                    { path: 'propriedades/criar', canActivate: [AuthGuard], component: ProdutosCatalogoPropriedadesCriarComponent },
                                    { path: 'propriedades/listar', canActivate: [AuthGuard], component: ProdutosCatalogoPropriedadesListarComponent },
                                    { path: 'propriedades/visualizar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoPropriedadesVisualizarComponent },
                                    { path: 'propriedades/editar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoPropriedadesEditarComponent },
                                ]
                            },

                            // Downloads
                            { path: 'downloads', component: DownloadsComponent, canActivate: [AuthGuard] },

                            // Usuarios
                            {
                                path: 'usuarios', canActivate: [AuthGuard], children: [
                                    { path: 'usuario-lista', component: UsuarioListaComponent, canActivate: [AuthGuard] },
                                    { path: 'usuario-edicao/:apelido', component: UsuarioEdicaoComponent, canActivate: [AuthGuard] },
                                    { path: 'usuario-meusdados', component: UsuarioMeusdadosComponent, canActivate: [AuthGuard] },
                                ]
                            },

                            // Clientes
                            { path: 'cliente/cliente', component: ClienteComponent, canActivate: [AuthGuard] },
                            {
                                path: 'calculadora-vrf', canActivate: [AuthGuard], component: CalculadoraVrfComponent, children: [
                                    { path: "select-evap-dialog", canActivate: [AuthGuard], component: SelectEvapDialogComponent }
                                ]
                            }

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
