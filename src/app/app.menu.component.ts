import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import { MenuService } from './service/menu/menu.service';
import { element } from 'protractor';

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
        this.menuService.buscar().toPromise().then((r) => {
            if (!!r) {
                this.model = r;
            }
        });
    }
}
