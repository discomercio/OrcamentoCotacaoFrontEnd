import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { DownloadsComponent } from './downloads/downloads.component';

import { AppMainComponent } from './app.main.component';
import { UsuarioEdicaoComponent } from './usuarios/usuario-edicao/usuario-edicao.component';
import { UsuarioListaComponent } from './usuarios/usuario-lista/usuario-lista.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: '', component: DashboardDemoComponent },
                    { path: 'dashboards/generic', component: DashboardDemoComponent },
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
