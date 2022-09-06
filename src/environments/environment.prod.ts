import { AppConfiguration } from "read-appsettings-json";

export const environment = {
    production: AppConfiguration.Setting().production,
    esperaAvisos: AppConfiguration.Setting().esperaAvisos,
    esperaErros: AppConfiguration.Setting().esperaErros,
    apiUrl: AppConfiguration.Setting().apiUrl,
    imgUrl: AppConfiguration.Setting().imgUrl,
    versaoApi: AppConfiguration.Setting().versaoApi,
    temporizadorSininho: AppConfiguration.Setting().temporizadorSininho
};
