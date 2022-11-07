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
    public config: any;

    constructor(http: HttpClient, private store: Store<{ Commom: CommonStates }>) {
        this.http = http;
        this.config = this.ObterConfigs();
    }

    ObterConfigs() {
        this.store.select("Commom").subscribe((data) => {
            if (data.AppSettings.length) {
                return data.AppSettings;
            }
        });

        const fetch = require("sync-fetch");

        const metadata = fetch("/assets/config/appsettings.json", {
            //   headers: {
            //     Accept: 'application/vnd.citationstyles.csl+json'
            //   }
        }).json();
        this.store.dispatch(setAppSettings({ payload: metadata }));

        return metadata;
    }
}