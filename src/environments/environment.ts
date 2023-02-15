import { HttpClient } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { CommonStates, setAppSettings } from "src/app/dto/commonStates";
import { AppSettingsService } from "src/app/utilities/appsettings/appsettings.service";

export class environment {
    public static _apiURL: string;
    constructor(){
        
    }
    production(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/appsettings.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().production;
        // return metadata;
    }
    esperaAvisos(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/appsettings.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().esperaAvisos;
        // return metadata;
    }
    esperaErros(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/appsettings.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().esperaErros;
        // return metadata;
    }
    public apiUrl(){
    //    return new AppSettingsService().apiBaseUrl();

        // return this.http
        //     .get<Array<NotaEmpresa>>(
        //         this.env.API.Gerais +
        //             "api/EmpresasFiliais/ObterEmpresasFiliais",
        //         { params: this.utils.getParams(filter) }
        //     )
        //     .toPromise()
        //     .then((response: any) => {
        //         let filiais = new Array<NotaEmpresa>();
        //         filiais = [...response.Content];

        //         this.store.dispatch(setListFiliais({ payload: filiais }));

        //         return filiais;
        //     });

    }
    imgUrl(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/appsettings.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().imgUrl;
        // return metadata;
    }
    versaoApi(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/version.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().versaoApi;
        // return metadata;
    }
    temporizadorSininho(): any {
        // const fetch = require("sync-fetch");

        // const metadata = fetch("/assets/config/appsettings.json", {
        //     //   headers: {
        //     //     Accept: 'application/vnd.citationstyles.csl+json'
        //     //   }
        // }).json().temporizadorSininho;
        // return metadata;
    }    

}

// import { AppSettingsService } from "src/app/utilities/appsettings/appsettings.service";

// let appsettings: AppSettingsService
// export const environment = {
//     production: appsettings.production,
//     esperaAvisos: appsettings.esperaAvisos,
//     esperaErros: appsettings.esperaErros,
//     apiUrl: appsettings.apiBaseUrl,
//     imgUrl: appsettings.imgUrl,
//     versaoApi: appsettings.versaoApi,
//     temporizadorSininho: appsettings.temporizadorSininho,
// };
