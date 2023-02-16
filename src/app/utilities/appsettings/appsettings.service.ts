import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class AppSettingsService {

    public config: any;
    public versao: any;

    constructor() {
        this.config = this.ObterConfigs();
        this.versao = this.ObterVersao();
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
        
        console.log(response);
        return response;
    }

    ObterVersao() {

        let response;

        if(localStorage.getItem("versaoApi")) {
            
            response = localStorage.getItem("versaoApi");
        }
        else {

            const fetch = require("sync-fetch");

            const metadata = fetch("/assets/config/version.json", {
            //   headers: {
            //     Accept: 'application/vnd.citationstyles.csl+json'
            //   }
            }).json().versaoApi;

            localStorage.setItem("versaoApi", metadata);
            
            response = metadata;
        }

        console.log(response);
        return response;
    }
}