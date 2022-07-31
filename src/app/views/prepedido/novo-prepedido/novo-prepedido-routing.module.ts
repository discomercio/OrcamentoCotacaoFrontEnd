import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NovoPrepedidoComponent } from './novo-prepedido.component';
import { PrePedidoConfirmarClienteComponent } from './confirmar-cliente/prepedidoconfirmar-cliente.component';
import { SelecionarClienteComponent } from './selecionar-cliente/selecionar-cliente.component';
import { PrePedidoCadastrarClienteComponent } from './cadastrar-cliente/prepedidocadastrar-cliente.component';
import { PrePedidoItensComponent } from './itens/prepedidoitens.component';
import { ConfirmarPrepedidoComponent } from './confirmar-prepedido/confirmar-prepedido.component';
import { PrePedidoObservacoesComponent } from './observacoes/prepedidoobservacoes.component';
import { AuthGuard } from 'src/app/main/guards/auth.guard';


const routes: Routes = [
  {
    path: 'novo-prepedido',
    canActivate: [AuthGuard],
    component: NovoPrepedidoComponent,
    children: [
      {
        path: 'confirmar-cliente/:cpfCnpj',
        canActivate: [AuthGuard],
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
      },
    ],
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NovoPrepedidoRoutingModule { }
