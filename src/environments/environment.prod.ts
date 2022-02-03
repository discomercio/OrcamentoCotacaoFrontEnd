// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
    autenticaStorageSession: false, //se false, gaurda no localstorage (o usuário pode escolher na tela)
    minutosRenovarTokenAntesExpirar: 60 * 24 * 4, //token emitido com 7 dias, renovamos 4 dais antes de vencer
    esperaAvisos: 3000,
    esperaErros: 5000,
    // apiUrl: 'http://localhost:60877/',
    apiUrl: 'http://arclubeorcamentocotacaoapi.itssolucoes.com.br/',
    imgUrl: 'http://10.255.0.90/img/',
    versaoApi: 'DEBUG',
    production: true
};
