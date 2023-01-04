import { PublicoCadastroClienteSucessoComponent } from 'src/app/views/publico/cadastro-cliente-sucesso/cadastro-cliente-sucesso.component';
import { UsuarioMeusdadosComponent } from '../../views/usuarios/usuario-meusdados/usuario-meusdados.component';
import { ClienteComponent } from '../../views/cliente/cliente.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardOrcamentoComponent } from '../../views/dashboard/orcamento/dashboard-orcamento.component';
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
import { VisualizarOrcamentoComponent } from 'src/app/views/orcamentos/novo-orcamento/visualizar-orcamento/visualizar-orcamento.component';
import { ProdutosCatalogoConsultarComponent } from 'src/app/views/produtos-catalogo/consultar/consultar.component';
import { AprovacaoOrcamentoClienteComponent } from 'src/app/views/orcamentos/aprovacao-orcamento-cliente/aprovacao-orcamento-cliente.component';
import { AuthGuard } from '../guards/auth.guard';
import { PublicoOrcamentoComponent } from 'src/app/views/publico/orcamento/orcamento.component';
import { CalculadoraVrfComponent } from 'src/app/views/calculadora-vrf/calculadora-vrf.component';
import { SelectEvapDialogComponent } from 'src/app/views/calculadora-vrf/select-evap-dialog/select-evap-dialog.component';
import { EditarOpcaoComponent } from 'src/app/views/orcamentos/editar/editar-opcao/editar-opcao.component';
import { SelecionarClienteComponent } from 'src/app/views/prepedido/novo-prepedido/selecionar-cliente/selecionar-cliente.component';
import { PrePedidoConfirmarClienteComponent } from 'src/app/views/prepedido/novo-prepedido/confirmar-cliente/prepedidoconfirmar-cliente.component';
import { PrePedidoObservacoesComponent } from 'src/app/views/prepedido/novo-prepedido/observacoes/prepedidoobservacoes.component';
import { ConfirmarPrepedidoComponent } from 'src/app/views/prepedido/novo-prepedido/confirmar-prepedido/confirmar-prepedido.component';
import { PrePedidoItensComponent } from 'src/app/views/prepedido/novo-prepedido/itens/prepedidoitens.component';
import { PrePedidoCadastrarClienteComponent } from 'src/app/views/prepedido/novo-prepedido/cadastrar-cliente/prepedidocadastrar-cliente.component';
import { PrepedidoDetalhesComponent } from 'src/app/views/prepedido/detalhes/prepedido-detalhes.component';
import { PedidoDetalhesComponent } from 'src/app/views/pedido/detalhes/pedido-detalhes.component';
import { EditarClienteComponent } from 'src/app/views/orcamentos/editar/editar-cliente/editar-cliente.component';
import { SelectProdDialogComponent } from 'src/app/views/orcamentos/novo-orcamento/select-prod-dialog/select-prod-dialog.component';
import { ProdutosCatalogoClonarComponent } from 'src/app/views/produtos-catalogo/clonar/clonar.component';
import { ClienteComponent2 } from 'src/app/views/prepedido/cliente/cliente/cliente.component';
import { ClienteCorpoComponent } from 'src/app/views/prepedido/cliente/cliente-corpo/cliente-corpo.component';
import { SenhaMeusdadosComponent } from 'src/app/views/senha/senha-meusdados.component';
import { PublicoCadastroClienteComponent } from 'src/app/views/publico/cadastro-cliente/cadastro-cliente.component';
import { OrcamentosVigentesComponent } from 'src/app/views/consultas/orcamentos-vigentes/orcamentos-vigentes.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppComponent,
                children: [
                    { path: 'account/login', component: LoginComponent, },
                    { path: 'orcamentos/aprovacao-orcamento-cliente', component: AprovacaoOrcamentoClienteComponent },
                    { path: 'publico/orcamento/:guid', component: PublicoOrcamentoComponent },
                    { path: 'publico/cadastro-cliente/:guid', component: PublicoCadastroClienteComponent },
                    { path: 'publico/cadastro-cliente-sucesso', component: PublicoCadastroClienteSucessoComponent },
                    {
                        path: '', component: AppMainComponent, canActivate: [AuthGuard], children: [

                            // Orçamentos
                            {
                                path: 'orcamentos', canActivate: [AuthGuard], children: [
                                    { path: "listar/:filtro", canActivate: [AuthGuard], component: OrcamentosListarComponent },
                                    { path: "cadastrar-cliente/:filtro", canActivate: [AuthGuard], component: CadastrarClienteComponent },
                                    { path: "itens/:filtro", canActivate: [AuthGuard], component: ItensComponent },
                                    { path: "select-prod", canActivate: [AuthGuard], component: SelectProdDialogComponent },
                                    { path: "visualizar-orcamento/:id", canActivate: [AuthGuard], component: VisualizarOrcamentoComponent },
                                    { path: "novo-orcamento", pathMatch: "full", canActivate: [AuthGuard], component: NovoOrcamentoComponent },
                                    { path: "aprovar-orcamento/:id", canActivate: [AuthGuard], component: AprovarOrcamentoComponent },
                                    { path: "editar/editar-opcao/:id", canActivate: [AuthGuard], component: EditarOpcaoComponent },
                                    { path: "editar/editar-cliente", canActivate: [AuthGuard], component: EditarClienteComponent },
                                ]
                            },

                            // Dashboard
                            { path: 'dashboards', canActivate: [AuthGuard], component: DashboardOrcamentoComponent },
                            {
                                path: 'novoprepedido',
                                canActivate: [AuthGuard],
                                // component: NovoPrepedidoComponent,
                                children: [
                                    {
                                        path: 'confirmar-cliente/:cpfCnpj',
                                        canActivate: [AuthGuard],
                                        pathMatch: "prefix",
                                        component: PrePedidoConfirmarClienteComponent
                                    },
                                    {
                                        path: 'cadastrar-cliente/:cpfCnpj',
                                        canActivate: [AuthGuard],
                                        component: PrePedidoCadastrarClienteComponent
                                    },
                                    {
                                        path: 'itens/:numeroPrepedido',
                                        canActivate: [AuthGuard],
                                        component: PrePedidoItensComponent
                                    },
                                    {
                                        path: 'itens',
                                        canActivate: [AuthGuard],
                                        pathMatch: "full",
                                        component: PrePedidoItensComponent
                                    },
                                    {
                                        path: 'observacoes',
                                        canActivate: [AuthGuard],
                                        component: PrePedidoObservacoesComponent
                                    },
                                    {
                                        path: 'confirmar-prepedido',
                                        canActivate: [AuthGuard],
                                        component: ConfirmarPrepedidoComponent
                                    },
                                    {
                                        path: '**',
                                        canActivate: [AuthGuard],
                                        component: SelecionarClienteComponent
                                    }
                                ]
                            },
                            // {
                            //     path: 'selecionacliente',
                            //     canActivate: [AuthGuard],
                            //     component: SelecionarClienteComponent
                            //   },
                            // { path: 'novo-prepedido', canActivate: [AuthGuard], component: NovoPrepedidoComponent },
                            // {
                            //     path: 'novo-prepedido',
                            //     canActivate: [AuthGuard],
                            //     component: NovoPrepedidoComponent,
                            //     children: [
                            //       {
                            //         path: 'confirmar-cliente/:cpfCnpj',
                            //         canActivate: [AuthGuard],
                            //         component: ConfirmarClienteComponent
                            //       },
                            //       {
                            //         path: 'cadastrar-cliente/:cpfCnpj',
                            //         canActivate: [AuthGuard],
                            //         component: CadastrarClienteComponent
                            //       },
                            //       {
                            //         path: 'itens/:numeroPrepedido',
                            //         canActivate: [AuthGuard],
                            //         component: ItensComponent
                            //       },
                            //       {
                            //         path: 'itens',
                            //         canActivate: [AuthGuard],
                            //         component: ItensComponent
                            //       },
                            //       {
                            //         path: 'observacoes',
                            //         canActivate: [AuthGuard],
                            //         component: ObservacoesComponent
                            //       },
                            //       {
                            //         path: 'confirmar-prepedido',
                            //         canActivate: [AuthGuard],
                            //         component: ConfirmarPrepedidoComponent
                            //       },
                            //       {
                            //         path: '**',
                            //         canActivate: [AuthGuard],
                            //         component: SelecionarClienteComponent
                            //       },
                            //     ],
                            //   },
                            // { path: 'selecionacliente',canActivate: [AuthGuard],component: SelecionarClienteComponent },
                            //tem suas prórpias rotas filhas

                            // path: 'pedido', canActivate: [AuthGuard], children: [
                            //     { path: 'novo-prepedido', canActivate: [AuthGuard], component: NovoPrepedidoComponent },
                            // ]
                            // Produtos Catalogo
                            {
                                path: 'produtos-catalogo', canActivate: [AuthGuard], children: [
                                    { path: 'consultar', canActivate: [AuthGuard], component: ProdutosCatalogoConsultarComponent },
                                    { path: 'criar', canActivate: [AuthGuard], component: ProdutosCatalogoCriarComponent },
                                    { path: 'listar', canActivate: [AuthGuard], component: ProdutosCatalogoListarComponent },
                                    { path: 'visualizar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoVisualizarComponent },
                                    { path: 'editar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoEditarComponent },
                                    { path: 'clonar/:id', canActivate: [AuthGuard], component: ProdutosCatalogoClonarComponent },
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
                            },

                            // Prepedido
                            { path: 'prepedido/detalhes/:numeroPrepedido', canActivate: [AuthGuard], component: PrepedidoDetalhesComponent },
                            { path: 'prepedido/cliente/cliente/:cpfcnpj', canActivate: [AuthGuard], component: ClienteComponent2 },
                            { path: 'prepedido/cliente/cliente-corpo', canActivate: [AuthGuard], component: ClienteCorpoComponent },

                            // Pedido
                            {
                                path: 'pedido/detalhes/:numeroPedido',
                                canActivate: [AuthGuard],
                                component: PedidoDetalhesComponent
                            },

                            // Senha
                            {
                                path: 'senha', canActivate: [AuthGuard], children: [
                                    { path: 'senha-meusdados', component: SenhaMeusdadosComponent, canActivate: [AuthGuard] },
                                ]
                            },
                            {
                                path: 'consultas', canActivate: [AuthGuard], children: [
                                    { path: "orcamentos-vigentes", canActivate: [AuthGuard], component: OrcamentosVigentesComponent },
                                ]
                            }
                        ]
                    }
                ]
            },
            // { path: 'dashboards/generic', component: DashboardDemoComponent },
        ], { scrollPositionRestoration: 'enabled' },
        )
        // NovoPrepedidoRoutingModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
