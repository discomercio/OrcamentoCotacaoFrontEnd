export const environment = {
    production: false,
    autenticaStorageSession: false, //se false, gaurda no localstorage (o usuário pode escolher na tela)
    minutosRenovarTokenAntesExpirar: 60 * 24 * 4, //token emitido com 7 dias, renovamos 4 dais antes de vencer
    esperaAvisos: 3000,
    esperaErros: 5000,
    apiUrl: 'http://arclubeorcamentocotacaoapi.itssolucoes.com.br/',
    // apiUrl: 'http://localhost:60877/',
    imgUrl: 'http://its-appdev02/img/',
    versaoApi: 'DEBUG'
};
