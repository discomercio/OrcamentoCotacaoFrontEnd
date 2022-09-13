import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class AppSettingsService {
    private appConfig: any;
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
        this.loadAppConfig()
    }

    loadAppConfig() {
        return this.http
            .get("/assets/config/appsettings.json")
            .toPromise()
            .then((config) => {
                this.appConfig = config;
            });
    }

    get apiBaseUrl(): string {
        return this.appConfig.apiBaseUrl;
    }
    get production(): string {
        return this.appConfig.production;
    }
    get esperaAvisos(): string {
        return this.appConfig.esperaAvisos;
    }
    get esperaErros(): string {
        return this.appConfig.esperaErros;
    }
    get imgUrl(): string {
        return this.appConfig.imgUrl;
    }
    get versaoApi(): string {
        return this.appConfig.versaoApi;
    }
    get temporizadorSininho(): string {
        return this.appConfig.temporizadorSininho;
    }
}
