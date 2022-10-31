import { SharedModule } from "./shared.module";
import { AutenticacaoService } from "./../service/autenticacao/autenticacao.service";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LocationStrategy, PathLocationStrategy } from "@angular/common";
import {
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTableModule,
    MatDialogModule,
} from "@angular/material";

import { AppCodeModule } from "./app.code.component";
import { AppComponent } from "./app.component";
import { AppMenuComponent } from "./app.menu.component";
import { CountryService } from "./../demo/service/countryservice";
import { EventService } from "./../demo/service/eventservice";
import { NodeService } from "./../demo/service/nodeservice";
import { MenuService } from "./app.menu.service";
import { CustomerService } from "./../demo/service/customerservice";
import { PhotoService } from "./../demo/service/photoservice";
import { ProductService } from "./../demo/service/productservice";
import { IconService } from "./../demo/service/iconservice";
import { MessageService } from "primeng/api";
import { KeyFilterModule } from "primeng/keyfilter";
import { AlertDialogComponent } from "../components/alert-dialog/alert-dialog.component";
import { DialogService } from "primeng/dynamicdialog";
import { NgxMaskModule } from "ngx-mask";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TokenInterceptor } from "./../service/autenticacao/token.interceptor";

import { DownloadsComponent } from "../views/downloads/downloads.component";

import { UsuarioEdicaoComponent } from "../views/usuarios/usuario-edicao/usuario-edicao.component";
import { UsuarioListaComponent } from "../views/usuarios/usuario-lista/usuario-lista.component";
import { ExportExcelService } from "./../service/export-files/export-excel.service";
import { ClienteComponent } from "../views/cliente/cliente.component";
import { LoginComponent } from "../views/login/login.component";

import { ProdutosCatalogoListarComponent } from "../views/produtos-catalogo/listar/listar.component";
import { ProdutosCatalogoEditarComponent } from "../views/produtos-catalogo/editar/editar.component";
import { ProdutosCatalogoVisualizarComponent } from "../views/produtos-catalogo/visualizar/visualizar.component";
import { ProdutosCatalogoCriarComponent } from "../views/produtos-catalogo/criar/criar.component";

import { ProdutosCatalogoPropriedadesListarComponent } from "./../views/produtos-catalogo/propriedades/listar/listar.component";
import { ProdutosCatalogoPropriedadesEditarComponent } from "./../views/produtos-catalogo/propriedades/editar/editar.component";
import { ProdutosCatalogoPropriedadesVisualizarComponent } from "./../views/produtos-catalogo/propriedades/visualizar/visualizar.component";
import { ProdutosCatalogoPropriedadesCriarComponent } from "./../views/produtos-catalogo/propriedades/criar/criar.component";

import { ValidacaoFormularioService } from "./../utilities/validacao-formulario/validacao-formulario.service";

import { OrcamentosModule } from "../views/orcamentos/orcamentos.module";
import { UsuarioMeusdadosComponent } from "../views/usuarios/usuario-meusdados/usuario-meusdados.component";
import { ProdutosCatalogoConsultarComponent } from "../views/produtos-catalogo/consultar/consultar.component";

//Alerts
import { AuthGuard } from "./guards/auth.guard";
import { PublicoOrcamentoComponent } from "../views/publico/orcamento/orcamento.component";
import { PublicoHeaderComponent } from "../views/publico/header/header.component";
import { PublicoCadastroClienteComponent } from "../views/publico/cadastro-cliente/cadastro-cliente.component";
import { CalculadoraVrfComponent } from "../views/calculadora-vrf/calculadora-vrf.component";
import { SelectEvapDialogComponent } from "../views/calculadora-vrf/select-evap-dialog/select-evap-dialog.component";
import { PrepedidoDetalhesComponent } from "../views/prepedido/detalhes/prepedido-detalhes.component";
import { PedidoDetalhesComponent } from "../views/pedido/detalhes/pedido-detalhes.component";
import { TextMaskModule } from "angular2-text-mask";
import { NovoPrepedidoModule } from "../views/prepedido/novo-prepedido/novo-prepedido.module";
import { ProdutosCatalogoClonarComponent } from "../views/produtos-catalogo/clonar/clonar.component";
import { ClienteModule } from "../views/prepedido/cliente/cliente.module";
import { SenhaMeusdadosComponent } from "../views/senha/senha-meusdados.component";
import { environment } from "src/environments/environment";
import { CepComponent } from "../views/cep/cep/cep.component";
import { CepDialogComponent } from "../views/cep/cep-dialog/cep-dialog.component";
import { EnderecoEntregaComponent } from "../views/cliente/endereco-entrega/endereco-entrega.component";
import { OrderListModule } from "primeng/orderlist";

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatSidenavModule,
        MatTableModule,
        MatDialogModule,
        BrowserModule,
        TextMaskModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppCodeModule,
        KeyFilterModule,
        FormsModule,
        FontAwesomeModule,
        NgxMaskModule.forRoot(),
        OrcamentosModule,
        NovoPrepedidoModule,
        ClienteModule,
        OrderListModule,
    ],
    declarations: [
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
        PublicoOrcamentoComponent,
        PublicoHeaderComponent,
        PublicoCadastroClienteComponent,
        CalculadoraVrfComponent,
        SelectEvapDialogComponent,
        PedidoDetalhesComponent,
        PublicoCadastroClienteComponent,
        PrepedidoDetalhesComponent,
        PedidoDetalhesComponent,
        ProdutosCatalogoClonarComponent,
        SenhaMeusdadosComponent,
        CepComponent,
        CepDialogComponent,
        EnderecoEntregaComponent,
    ],
    providers: [
        // {
        //     provide: APP_INITIALIZER,
        //     useFactory: initConfig,
        //     deps: [AppSettingsService],
        //     multi: true,
        // },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
        },

        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,
        MenuService,
        MessageService,
        DialogService,
        AppMenuComponent,
        ExportExcelService,
        ValidacaoFormularioService,
        AutenticacaoService,
        AuthGuard,
        environment,
        AppComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private app: AppComponent, private env: environment) {
        app._apiURL = env.apiUrl();
        //this.appComponent._apiURL
    }
}

// export function initConfig(appConfigService: AppSettingsService) {
//     return () => appConfigService.loadAppConfig();
// }
