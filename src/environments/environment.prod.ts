import { HttpClient } from "@angular/common/http";
import { AppSettingsService } from "src/app/utilities/appsettings/appsettings.service";

export const enviroment = {
    production : true
}

// export class environment {

    
//     production(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().production;
//         // return metadata;
//     }
//     esperaAvisos(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().esperaAvisos;
//         // return metadata;
//     }
//     esperaErros(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().esperaErros;
//         // return metadata;
//     }
//     apiUrl(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().apiUrl;
//         // return metadata;
//     }
//     imgUrl(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().imgUrl;
//         // return metadata;
//     }
//     versaoApi(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/version.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().versaoApi;
//         // return metadata;
//     }
//     temporizadorSininho(): any {
//         // const fetch = require("sync-fetch");

//         // const metadata = fetch("/assets/config/appsettings.json", {
//         //     //   headers: {
//         //     //     Accept: 'application/vnd.citationstyles.csl+json'
//         //     //   }
//         // }).json().temporizadorSininho;
//         // return metadata;
//     }

// }

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
