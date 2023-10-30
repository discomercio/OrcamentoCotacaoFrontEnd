import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    layoutMode = 'static';

    darkMenu = false;

    profileMode = 'inline';

    ripple = true;

    inputStyle = 'outlined';
    _apiURL = "";

    subscription: Subscription;
    browserRefresh: boolean;


    constructor(
        private primengConfig: PrimeNGConfig,
        private router: Router
    ) {
        this.subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (!router.navigated) {
                    sessionStorage.removeItem("filtro");
                    sessionStorage.removeItem("urlAnterior");
                }
            }
        });
    }

    ngOnInit() {
        this.primengConfig.setTranslation({
            accept: 'Accept',
            reject: 'Cancel',
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
            dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        });
        this.primengConfig.ripple = true;
    }
}
