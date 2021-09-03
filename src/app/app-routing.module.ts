import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { DownloadsComponent } from './downloads/downloads/downloads.component';

import { AppMainComponent } from './app.main.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { UsuarioEdicaoComponent } from './usuario-edicao/usuario-edicao.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: '', component: DashboardDemoComponent },
                    { path: 'dashboards/generic', component: DashboardDemoComponent },
                    { path: 'downloads/downloads', component: DownloadsComponent },
                    { path: 'usuarios', component: UsuariosComponent },
                    { path: 'usuario-edicao/:apelido', component: UsuarioEdicaoComponent }
                ]
            },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
