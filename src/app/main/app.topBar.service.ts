import { Injectable } from "@angular/core";
import { ListaQuantidadeMensagemPendenteResponse } from "../dto/mensageria/lista-quantidade-mensagem-pendente-response";
import { AutenticacaoService } from "../service/autenticacao/autenticacao.service";
import { MensageriaService } from "../service/mensageria/mensageria.service";
import { AlertaService } from "../components/alert-dialog/alerta.service";
import { DataUtils } from "../utilities/formatarString/data-utils";

@Injectable({
    providedIn: 'root'
})
export class AppTopBarService {
    constructor(
        private readonly mensageriaService: MensageriaService,
        private readonly alertaService: AlertaService,
    ) {
        this.sininho = sessionStorage.getItem("sininho") == "S" ? true : false;
    }
    dataUtils: DataUtils = new DataUtils();
    sininho: boolean;
    public listaMensagemPendente: ListaQuantidadeMensagemPendenteResponse = new ListaQuantidadeMensagemPendenteResponse();
    qtdMensagem: any;
    interval: any = 0;

    ligarInterval() {
        console.log("entrada interval: " + this.interval);
        if(this.interval > 0){
            console.log("já tem interval: " + this.interval);
            return;
        } 
        this.mensageriaService.appSettingsService.retornarVersao().toPromise().then((r) => {

            let temporizador = r.temporizadorSininho;
            this.interval = setInterval(() => {
                if (this.interval > 0) {
                    console.log("rolando interval: " + this.interval);
                    this.obterQuantidadeMensagemPendente();
                    this.sininho = true;
                } else {
                    this.limparInterval();
                }

            }, Number(temporizador));
            console.log("fim interval: " + this.interval);
        })


    }
    obterQuantidadeMensagemPendente() {
        
        
        if (!this.sininho) {
            this.limparInterval();
            return;
        }
        console.log(this.dataUtils.formata_data_e_talvez_hora_hhmmss(new Date()));

        this.mensageriaService.obterQuantidadeMensagemPendentePorLoja().toPromise().then((r) => {
            if (!r.Sucesso) {
                this.alertaService.mostrarMensagem(r.Mensagem);
                return;
            }

            this.listaMensagemPendente = r;
            if (!!this.listaMensagemPendente.listaQtdeMensagemPendente) {
                this.qtdMensagem = this.listaMensagemPendente.listaQtdeMensagemPendente.reduce((soma, item) =>
                    soma + item.qtde, 0);
            }
            else this.qtdMensagem = 0;

        }).catch((e) => {
            this.limparInterval();
            if (e.status == 401) {
                this.limparInterval();
            }
            this.alertaService.mostrarErroInternet(e);
        });
    }

    limparInterval() {
        clearInterval(this.interval);
        this.interval = 0;
        this.sininho = false;
        sessionStorage.setItem("sininho", "N");
    }
}