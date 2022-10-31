import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { AppSettingsService } from '../utilities/appsettings/appsettings.service';
import { environment } from 'src/environments/environment';
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
    _apiURL = ""
    constructor(
        private primengConfig: PrimeNGConfig,
        private readonly router: Router,
        private env : environment
        ) {
            // private appSettings: AppSettingsService
            // console.log(appSettings.apiBaseUrl)
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
        environment._apiURL = this.env.apiUrl()
    }
}
