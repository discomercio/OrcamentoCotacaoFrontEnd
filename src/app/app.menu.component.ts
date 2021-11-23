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
                    { label: 'Aprovar orçamento', icon: 'fa fa-list-alt', routerLink: ['orcamentos/novo-orcamento/aprovar-orcamento'] },
                    { 
                        label: 'Cliente', icon: 'fa fa-user', routerLink: ['cliente/cliente'] 
                    },
                    {
                        label: 'Dashboards', icon: 'pi pi-fw pi-home', routerLink: ['/dashboards'],
                        items: [
                            { label: 'Generic', icon: 'pi pi-fw pi-home', routerLink: ['/dashboards/generic'] }
                        ]
                    },
                    {
                        label: 'Orçamentos', icon: 'fa fa-calculator', routerLink: ['/orcamentos'],
                        items: [
                            { label: 'Novo', icon: 'pi pi-plus', routerLink: ['/novo-orcamento/teste-orcamento'] },
                            { label: 'Pendentes', icon: 'pi pi-exclamation-circle', routerLink: ['/orcamentos/listar-orcamentos/lista/pendente'] },
                            { label: 'Lista de orçamentos', icon: 'fa fa-list-alt', routerLink: ['/orcamentos/listar-orcamentos/lista/orcamentos'] },
                            { label: 'Lista de pedidos', icon: 'fa fa-list-alt', routerLink: ['/orcamentos/listar-orcamentos/lista/pedido'] },
                            { label: 'Relatórios', icon: 'fa fa-clipboard', routerLink: ['/orcamentos/listar-orcamentos/lista/relatorios'] }
                        ]
                    },
                    { label: 'Produtos', icon: 'fa fa-list-alt', routerLink: ['/produtos/lista-produtos/lista-produtos'] },
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
