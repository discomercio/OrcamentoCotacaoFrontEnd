import { AppConfiguration } from "read-appsettings-json";

export const environment = {
    production: AppConfiguration.Setting().production,
    autenticaStorageSession: false, //se false, gaurda no localstorage (o usuário pode escolher na tela)
    minutosRenovarTokenAntesExpirar: 60 * 24 * 4, //token emitido com 7 dias, renovamos 4 dais antes de vencer
    esperaAvisos: AppConfiguration.Setting().esperaAvisos,
    esperaErros: AppConfiguration.Setting().esperaErros,
    apiUrl: AppConfiguration.Setting().apiUrl,
    imgUrl: AppConfiguration.Setting().imgUrl,
    versaoApi: AppConfiguration.Setting().versaoApi,
    temporizadorSininho: AppConfiguration.Setting().temporizadorSininho
};