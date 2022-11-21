import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class AppSettingsService {

    public config: any;

    constructor() {
        this.config = this.ObterConfigs();
    }

    ObterConfigs() {

        let response;

        if(localStorage.getItem("appsettings")) {
            
            response = JSON.parse(localStorage.getItem("appsettings"));
        }
        else {

            const fetch = require("sync-fetch");

            const metadata = fetch("/assets/config/appsettings.json", {
                //   headers: {
                //     Accept: 'application/vnd.citationstyles.csl+json'
                //   }
            }).json();

            localStorage.setItem("appsettings", JSON.stringify(metadata));
            
            response = metadata;
        }

        return response;
    }
}