import { AutenticacaoService } from './../service/autenticacao/autenticacao.service';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppRoutingModule } from './routing/app-routing.module';



import { AppCodeModule } from './app.code.component';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AppConfigComponent } from './app.config.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppProfileComponent } from './app.profile.component';
import { CountryService } from './../demo/service/countryservice';
import { EventService } from './../demo/service/eventservice';
import { NodeService } from './../demo/service/nodeservice';
import { MenuService } from './app.menu.service';
import { CustomerService } from './../demo/service/customerservice';
import { PhotoService } from './../demo/service/photoservice';
import { ProductService } from './../demo/service/productservice';
import { IconService } from './../demo/service/iconservice';
import { MessageService } from 'primeng/api';
import { KeyFilterModule } from 'primeng/keyfilter';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxMaskModule } from 'ngx-mask';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TokenInterceptor } from './../service/autenticacao/token.interceptor';

import { DownloadsComponent } from '../views/downloads/downloads.component';

import { UsuarioEdicaoComponent } from '../views/usuarios/usuario-edicao/usuario-edicao.component';
import { UsuarioListaComponent } from '../views/usuarios/usuario-lista/usuario-lista.component';
import { ExportExcelService } from './../service/export-files/export-excel.service';
import { ClienteComponent } from '../views/cliente/cliente.component';
import { LoginComponent } from '../views/login/login.component';

import { ProdutosCatalogoListarComponent } from '../views/produtos-catalogo/listar/listar.component';
import { ProdutosCatalogoEditarComponent } from '../views/produtos-catalogo/editar/editar.component';
import { ProdutosCatalogoVisualizarComponent } from '../views/produtos-catalogo/visualizar/visualizar.component';
import { ProdutosCatalogoCriarComponent } from '../views/produtos-catalogo/criar/criar.component';

import { ProdutosCatalogoPropriedadesListarComponent } from './../views/produtos-catalogo/propriedades/listar/listar.component';
import { ProdutosCatalogoPropriedadesEditarComponent } from './../views/produtos-catalogo/propriedades/editar/editar.component';
import { ProdutosCatalogoPropriedadesVisualizarComponent } from './../views/produtos-catalogo/propriedades/visualizar/visualizar.component';
import { ProdutosCatalogoPropriedadesCriarComponent } from './../views/produtos-catalogo/propriedades/criar/criar.component';

import { ValidacaoFormularioService } from './../utilities/validacao-formulario/validacao-formulario.service';

import { OrcamentosModule } from '../views/orcamentos/orcamentos.module';
import { UsuarioMeusdadosComponent } from '../views/usuarios/usuario-meusdados/usuario-meusdados.component';
import { AppModuleComponents } from './app.module.component';
import { AppModuleNgComponents } from './app.module.ngcomponent';
import { ProdutosCatalogoConsultarComponent } from '../views/produtos-catalogo/consultar/consultar.component';

//Alerts
import { NovoPedidoComponent } from '../views/pedido/novo-pedido/novo-pedido.component';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
    imports: [
        AppModuleComponents,
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppCodeModule,
        KeyFilterModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        NgxMaskModule.forRoot(),
        OrcamentosModule,
        AppModuleNgComponents
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppProfileComponent,
        AppConfigComponent,
        DownloadsComponent,
        AlertDialogComponent,
        UsuarioEdicaoComponent,
        UsuarioListaComponent,
        ClienteComponent,
        LoginComponent,
        ProdutosCatalogoEditarComponent,
        ProdutosCatalogoListarComponent,
        ProdutosCatalogoVisualizarComponent,
        ProdutosCatalogoCriarComponent,
        ProdutosCatalogoPropriedadesEditarComponent,
        ProdutosCatalogoPropriedadesListarComponent,
        ProdutosCatalogoPropriedadesVisualizarComponent,
        ProdutosCatalogoPropriedadesCriarComponent,
        UsuarioMeusdadosComponent,
        ProdutosCatalogoConsultarComponent,
        NovoPedidoComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, MenuService, MessageService, DialogService,
        AppMenuComponent, ExportExcelService, ValidacaoFormularioService,
        AutenticacaoService,
        AuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
