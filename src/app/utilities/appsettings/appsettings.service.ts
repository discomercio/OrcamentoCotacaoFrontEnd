import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { CommonStates, setAppSettings } from "src/app/dto/commonStates";

@Injectable({
    providedIn: "root",
})
export class AppSettingsService {
    private appConfig: any;
    private http: HttpClient;

    constructor(http: HttpClient, private store: Store<{ Commom: CommonStates }>) {
        this.http = http;
        //this.loadAppConfig()
    }
    

    loadAppConfig() {
        this.store.select("Commom").subscribe((data) => {
            if (data.listAppSettings.length) return data.listAppSettings;
        });

        const fetch = require("sync-fetch");

        const metadata = fetch("/assets/config/appsettings.json", {
            //   headers: {
            //     Accept: 'application/vnd.citationstyles.csl+json'
            //   }
        }).json();
        this.store.dispatch(setAppSettings({ payload: metadata }));

        return metadata;
        // return this.http
        //     .get("/assets/config/appsettings.json")
        //     .toPromise()
        //     .then((config) => {
        //         this.appConfig = config;
        //     });
    }

    apiBaseUrl(): string {
        return this.loadAppConfig().apiUrl;
        //return this.appConfig.apiBaseUrl;
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
