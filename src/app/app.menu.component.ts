import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import { MenuService } from './service/menu/menu.service';

@Component({
    selector: 'app-menu',
    template: `
    <ul class="layout-menu layout-main-menu clearfix">
        <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
    </ul>
    
    `
})
export class AppMenuComponent implements OnInit {
    constructor(private readonly menuService: MenuService) {

    }

    public model: MenuItem[];


    ngOnInit() {
        this.model = [
            {
                items: [
                    {
                        label: 'Dashboards', icon: 'pi pi-fw pi-home', routerLink: ['/dashboards'],
                        items: [
                            { label: 'Generic', icon: 'pi pi-fw pi-home', routerLink: ['/dashboards/generic'] }
                        ]
                    },
                    {
                        label: 'Orçamentos', icon: 'fa fa-calculator', routerLink: ['/orcamentos'],
                        items: [
                            { label: 'Novo', icon: 'pi pi-plus', routerLink: ['/orcamentos/novo'] }
                        ]
                    },
                    { label: 'Downloads', icon: 'pi pi-download', routerLink: ['/downloads'] },
                    {
                        label: 'Usuários', icon: 'pi pi-users', routerLink: ['/usuarios/usuario-lista'],
                        items: [
                            { label: 'Administradores', icon: "pi pi-users", routerLink: ['/usuarios/usuario-lista'] }
                        ]
                    }
                ],
            }
        ];
    }
}
