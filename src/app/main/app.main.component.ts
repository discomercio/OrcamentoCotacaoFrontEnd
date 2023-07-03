import { Component, Renderer2 } from '@angular/core';
import { MenuService } from './app.menu.service';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { SistemaService } from '../service/sistema/sistema.service';
import { AppTopBarService } from './app.topBar.service';
import { AutenticacaoService } from '../service/autenticacao/autenticacao.service';

@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html',
    styleUrls: ['./app.main.component.scss']
})
export class AppMainComponent {


    rotateMenuButton: boolean;

    topbarMenuActive: boolean;

    overlayMenuActive: boolean;

    staticMenuDesktopInactive: boolean;

    staticMenuMobileActive: boolean;

    layoutMenuScroller: HTMLDivElement;

    menuClick: boolean;

    topbarItemClick: boolean;

    activeTopbarItem: any;

    menuHoverActive: boolean;

    configActive: boolean;

    configClick: boolean;
    carregando: boolean;

    public versaoFront: string;
    public versaoApi: string;

    constructor(public renderer: Renderer2, private menuService: MenuService,
        private primengConfig: PrimeNGConfig, public app: AppComponent,
        public readonly sistemaService: SistemaService,
        private readonly alertaService: AlertaService,
        public readonly appTopBarService: AppTopBarService,
        public readonly autenticacaoService: AutenticacaoService
    ) {

        this.buscarVersao();

        if (!this.appTopBarService.sininho && this.autenticacaoService.authEstaLogado()) {
            this.appTopBarService.obterQuantidadeMensagemPendente();
            this.appTopBarService.ligarInterval();
        }
    }

    onLayoutClick() {
        if (!this.topbarItemClick) {
            this.activeTopbarItem = null;
            this.topbarMenuActive = false;
        }

        if (!this.menuClick) {
            if (this.isHorizontal() || this.isSlim()) {
                this.menuService.reset();
            }

            if (this.overlayMenuActive || this.staticMenuMobileActive) {
                this.hideOverlayMenu();
            }

            this.menuHoverActive = false;
        }

        if (this.configActive && !this.configClick) {
            this.configActive = false;
        }

        this.configClick = false;
        this.topbarItemClick = false;
        this.menuClick = false;

        this.buscarVersao();

        if (!this.appTopBarService.sininho && this.autenticacaoService.authEstaLogado()) {
            this.appTopBarService.obterQuantidadeMensagemPendente();
            this.appTopBarService.ligarInterval();
        }
    }

    buscarVersao() {
        this.versaoFront = environment.version;
        this.sistemaService.retornarVersao().toPromise().then((r) => {
            if (r != null) {
                this.versaoApi = r.versao;
                this.sistemaService.versaoFrontTxt = r.versaoFront;
                if (this.versaoFront != this.sistemaService.versaoFrontTxt) {
                    this.alertaService.mostrarErroPacote();
                    return;
                }
            }
        }).catch((e) => {
            this.alertaService.mostrarErroInternet(e);
        });
    }

    onMenuButtonClick(event) {
        this.menuClick = true;
        this.rotateMenuButton = !this.rotateMenuButton;
        this.topbarMenuActive = false;

        if (this.app.layoutMode === 'overlay') {
            this.overlayMenuActive = !this.overlayMenuActive;
        } else {
            if (this.isDesktop()) {
                this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
            } else {
                this.staticMenuMobileActive = !this.staticMenuMobileActive;
            }
        }

        event.preventDefault();
    }

    onMenuClick($event) {
        this.menuClick = true;
    }

    onTopbarMenuButtonClick(event) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;

        this.hideOverlayMenu();

        event.preventDefault();
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item;
        }

        event.preventDefault();
    }

    onTopbarSubItemClick(event) {
        event.preventDefault();
    }

    onConfigClick(event) {
        this.configClick = true;
    }

    onRippleChange(event) {
        this.app.ripple = event.checked;
        this.primengConfig = event.checked;
    }

    hideOverlayMenu() {
        this.rotateMenuButton = false;
        this.overlayMenuActive = false;
        this.staticMenuMobileActive = false;
    }

    isTablet() {
        const width = window.innerWidth;
        return width <= 1024 && width > 640;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    isMobile() {
        return window.innerWidth <= 640;
    }

    isStatic() {
        return this.app.layoutMode === 'static';
    }

    isOverlay() {
        return this.app.layoutMode === 'overlay';
    }

    isHorizontal() {
        return this.app.layoutMode === 'horizontal';
    }


    isSlim() {
        return this.app.layoutMode === 'slim';
    }
}
