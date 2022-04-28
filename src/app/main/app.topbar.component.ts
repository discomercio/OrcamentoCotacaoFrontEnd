import { Lojas } from './../dto/lojas/lojas';
import {Component} from '@angular/core';
import {Router } from '@angular/router';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import { AutenticacaoService } from './../service/autenticacao/autenticacao.service';
import { DropDownItem } from './../orcamentos/models/DropDownItem';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-topbar',
    template: `
    <style>
        .hidden {display:none;}
    </style>
    <form [formGroup]="form">
        <div class="topbar clearfix">
            <div class="topbar-left p-text-center">
                <a routerLink="/">
                    <img src="assets/layout/images/LogoUnis.png" class="topbar-logo" routerLink="/" />
                </a>
            </div>

            <div class="topbar-right">
                <a id="menu-button" href="#" (click)="appMain.onMenuButtonClick($event)" class="p-shadow-10"
                   [ngClass]="{'menu-button-rotate': appMain.rotateMenuButton}">
                    <i class="pi pi-angle-left"></i>
               </a>

                <a id="topbar-menu-button" href="#" (click)="appMain.onTopbarMenuButtonClick($event)">
                    <i class="pi pi-bars"></i>
                </a>

                <ul class="topbar-items fadeInDown" [ngClass]="{'topbar-items-visible': appMain.topbarMenuActive}">
                    <li #profile class="profile-item" *ngIf="app.profileMode==='top'|| appMain.isHorizontal()"
                        [ngClass]="{'active-top-menu':appMain.activeTopbarItem === profile}">

                        <a href="#" (click)="appMain.onTopbarItemClick($event,profile)">
                            <img class="profile-image" src="assets/layout/images/avatar.png" />
                            <span class="topbar-item-name">Isabel Lopez</span>
                            <span class="topbar-item-role">Marketing</span>
                        </a>

                        <ul class="layout-menu" [ngClass]="{'fadeInDown':!appMain.isMobile()}">
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-user"></i>
                                    <span>Profile</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-lock"></i>
                                    <span>Privacy</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-cog"></i>
                                    <span>Settings</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-sign-out"></i>
                                    <span>Logout</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li #settings [ngClass]="{'active-top-menu':appMain.activeTopbarItem === settings}">
                        <a href="#" (click)="appMain.onTopbarItemClick($event,settings)">
                            <i class="topbar-icon pi pi-cog"></i>
                            <span class="topbar-item-name">Settings</span>
                        </a>
                        <ul class="layout-menu" [ngClass]="{'fadeInDown':!appMain.isMobile()}">
                            <!--
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-palette"></i>
                                    <span>Change Theme</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-star-o"></i>
                                    <span>Favorites</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-lock"></i>
                                    <span>Lock Screen</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                    <i class="pi pi-fw pi-image"></i>
                                    <span>Wallpaper</span>
                                </a>
                            </li>
                            -->
                            <li role="menuitem">
                            <a href="#" [routerLink]="['/usuarios/usuario-meusdados']">
                                <i class="pi pi-fw pi-user"></i>
                                <span>Meus dados</span>
                            </a>
                        </li>
                            <li role="menuitem">
                                <a href="#" (click)="logoffClick()">
                                    <i class="pi pi-fw pi-image"></i>
                                    <span>Logoff</span>
                                </a>
                            </li>
                        </ul>
                    </li>
<!--
                    <li #messages [ngClass]="{'active-top-menu':appMain.activeTopbarItem === messages}">
                        <a href="#" (click)="appMain.onTopbarItemClick($event,messages)">
                            <i class="topbar-icon animated swing pi pi-fw pi-envelope"></i>
                            <span class="topbar-badge animated rubberBand">5</span>
                            <span class="topbar-item-name">Messages</span>
                        </a>
                        <ul class="layout-menu" [ngClass]="{'fadeInDown':!appMain.isMobile()}">
                            <li role="menuitem">
                                <a href="#" class="topbar-message" (click)="appMain.onTopbarSubItemClick($event)">
                                    <img src="assets/layout/images/avatar1.png" width="35"/>
                                    <span>Give me a call</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" class="topbar-message" (click)="appMain.onTopbarSubItemClick($event)">
                                    <img src="assets/layout/images/avatar2.png" width="35"/>
                                    <span>Sales reports attached</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" class="topbar-message" (click)="appMain.onTopbarSubItemClick($event)">
                                    <img src="assets/layout/images/avatar3.png" width="35"/>
                                    <span>About your invoice</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" class="topbar-message" (click)="appMain.onTopbarSubItemClick($event)">
                                    <img src="assets/layout/images/avatar2.png" width="35"/>
                                    <span>Meeting today at 10pm</span>
                                </a>
                            </li>
                            <li role="menuitem">
                                <a href="#" class="topbar-message" (click)="appMain.onTopbarSubItemClick($event)">
                                    <img src="assets/layout/images/avatar4.png" width="35"/>
                                    <span>Out of office</span>
                                </a>
                            </li>
                        </ul>
                    </li> -->
                    <li #notifications [ngClass]="{'active-top-menu':appMain.activeTopbarItem === notifications}">
                        <a href="#" (click)="appMain.onTopbarItemClick($event,notifications)">
                            <i class="topbar-icon pi pi-fw pi-bell"></i>
                            <span class="topbar-badge animated rubberBand">0</span>
                            <span class="topbar-item-name">Notifications</span>
                        </a>
                        <ul class="layout-menu" [ngClass]="{'fadeInDown':!appMain.isMobile()}">
                            <li role="menuitem">
                                <a href="orcamentos/listar/orcamentos?msgPendentes=true">
                                    <i class="pi pi-fw pi-sliders-h"></i>
                                    <span>Mensagens não Lida</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li #search class="search-item" [ngClass]="{'active-top-menu':appMain.activeTopbarItem === search}"
                        (click)="appMain.onTopbarItemClick($event,search)">
                        <div class="topbar-search">
                            <p-dropdown
                                formControlName="cboLojas"
                                [options]="lojas"
                                emptyFilterMessage="Nenhum item encontrado"
                                optionValue="Id" optionLabel="Value"
                                (onChange)="cboLojas_onChange($event)"
                                [ngClass]="{'hidden': this.form.controls.cboLojas.disabled}"
                            ></p-dropdown>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </form>
    `
})
export class AppTopBarComponent {


    constructor(
        public app: AppComponent,
        public appMain: AppMainComponent,
        private readonly autenticacaoService:  AutenticacaoService,
        private readonly router: Router,
        private fb: FormBuilder
    ) {}

    public form: FormGroup;
    lojas: Array<DropDownItem> = [];

    ngOnInit(): void {
        this.criarForm();
        this.populaComboLojas();
    }

    criarForm() {
    this.form = this.fb.group({
        cboLojas: [''],
    });
    }

    logoffClick() {
        this.autenticacaoService.authLogout();
        this.router.navigate(['/account/login'], { queryParams: {} });
      }

      populaComboLojas() {
          var lojaLogada = sessionStorage.getItem("lojaLogada");
          var lojas = sessionStorage.getItem('lojas');

          if(lojas) {
            lojas.toString().split(',').forEach(x => {
                this.lojas.push({ Id:x, Value:`Loja: ${x}`});
            })
          };

          if(!lojas) {
            if(this.autenticacaoService._lojasUsuarioLogado) {
                this.autenticacaoService._lojasUsuarioLogado.forEach(x => {
                    this.lojas.push({ Id:x, Value:`Loja: ${x}`});
                });
            }
          }

          if(this.lojas.length > 0) {
            if(lojaLogada) {
                this.form.controls.cboLojas.setValue(lojaLogada);
            }
          }

          if(this.lojas.length <= 1) {
            this.form.controls.cboLojas.disable();
          }
      }

      cboLojas_onChange($event) {
        sessionStorage.setItem("lojaLogada", $event.value);
        this.autenticacaoService._lojaLogado = $event.value;
        window.location.reload();
    }
}
