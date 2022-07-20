import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

import { MensageriaComponent } from '../views/mensageria/mensageria.component';
import { AppComponent } from './app.component';
import { AppConfigComponent } from './app.config.component';
import { AppFooterComponent } from './app.footer.component';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppModuleComponents } from './app.module.component';
import { AppModuleNgComponents } from './app.module.ngcomponent';
import { AppProfileComponent } from './app.profile.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppRoutingModule } from './routing/app-routing.module';

@NgModule({
    declarations: [
        AppComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppProfileComponent,
        AppConfigComponent,

        MensageriaComponent,
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        AppModuleComponents,
        AppModuleNgComponents,
        ReactiveFormsModule,
        DialogModule,
    ],
    exports: [
        AppModuleComponents,
        AppModuleNgComponents,
        ReactiveFormsModule,
        DialogModule,

        MensageriaComponent,
    ],
})
export class SharedModule { }
