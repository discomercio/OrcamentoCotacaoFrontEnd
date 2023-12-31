import { Component, Renderer2 } from '@angular/core';
import { MenuService } from './app.menu.service';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app.component';
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

    constructor(public renderer: Renderer2, private menuService: MenuService,
        private primengConfig: PrimeNGConfig, public app: AppComponent,
        public readonly appTopBarService: AppTopBarService,
        public readonly autenticacaoService: AutenticacaoService
    ) {

        

        if (!this.appTopBarService.iniciouSininho && this.autenticacaoService.authEstaLogado()) {
            this.appTopBarService.iniciouSininho = true;
            this.appTopBarService.obterQuantidadeMensagemPendente();
            this.appTopBarService.ligarInterval();
        }

        this.appTopBarService.buscarVersao();
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

        if(this.menuClick){
            this.appTopBarService.buscarVersao();
        }

        if (!this.menuClick && !this.configClick && !this.topbarItemClick &&
            !this.appTopBarService.sininho && this.autenticacaoService.authEstaLogado()) {
            sessionStorage.setItem("sininho", "S");
            this.appTopBarService.sininho = true;
            this.appTopBarService.obterQuantidadeMensagemPendente();
            this.appTopBarService.buscarVersao();
            this.appTopBarService.ligarInterval();
        }

        this.configClick = false;
        this.topbarItemClick = false;
        this.menuClick = false;
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
