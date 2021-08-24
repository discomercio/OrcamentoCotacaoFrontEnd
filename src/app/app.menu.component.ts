import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-menu',
    template: `
    <ul class="layout-menu layout-main-menu clearfix">
        <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
    </ul>
    `
})
export class AppMenuComponent implements OnInit {

    model: any[];

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
                    { label: 'Downloads', icon: 'pi pi-download', routerLink: ['/downloads/downloads'] }
                ],
            }
        ];
    }
}
