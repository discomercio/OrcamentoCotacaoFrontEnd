
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from 'src/app/servicos/autenticacao/login.guard';
import { NovoPrepedidoComponent } from './novo-prepedido.component';
import { ConfirmarClienteComponent } from './confirmar-cliente/confirmar-cliente.component';
import { SelecionarClienteComponent } from './selecionar-cliente/selecionar-cliente.component';
import { CadastrarClienteComponent } from './cadastrar-cliente/cadastrar-cliente.component';
import { ItensComponent } from './itens/itens.component';
import { DadosPagtoComponent } from './dados-pagto/dados-pagto.component';
import { ConfirmarPrepedidoComponent } from './confirmar-prepedido/confirmar-prepedido.component';
import { ObservacoesComponent } from './observacoes/observacoes.component';


const routes: Routes = [
  {
    path: 'novo-prepedido',
    canActivate: [LoginGuard],
    component: NovoPrepedidoComponent,
    children: [
      {
        path: 'confirmar-cliente/:cpfCnpj',
        canActivate: [LoginGuard],
        component: ConfirmarClienteComponent
      },
      {
        path: 'cadastrar-cliente/:cpfCnpj',
        canActivate: [LoginGuard],
        component: CadastrarClienteComponent
      },
      {
        path: 'itens/:numeroPrepedido',
        canActivate: [LoginGuard],
        component: ItensComponent
      },
      {
        path: 'itens',
        canActivate: [LoginGuard],
        component: ItensComponent
      },
      {
        path: 'observacoes',
        canActivate: [LoginGuard],
        component: ObservacoesComponent
      },
      {
        path: 'confirmar-prepedido',
        canActivate: [LoginGuard],
        component: ConfirmarPrepedidoComponent
      },
      {
        path: '**',
        canActivate: [LoginGuard],
        component: SelecionarClienteComponent
      },
    ],
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NovoPrepedidoRoutingModule { }
