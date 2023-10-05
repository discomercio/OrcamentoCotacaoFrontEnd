import { strict } from 'assert';
import { concat } from 'rxjs/operators';
import { SSF } from 'xlsx';

/*
classes auxiliares de retornos
*/
class decodifica_hora_retorno {
    sucesso: boolean;
    hora: string;
    min: string;
    seg: string;
}
class decodifica_data_retorno {
    sucesso: boolean;
    dia: string;
    mes: string;
    ano: string;
}



export class DataUtils {
    public static formataParaFormulario(data: Date): string {
        if (typeof data.toISOString != "function")
            data = new Date(data);
        //queremos o formato yyy-mm-dd, é o que o input date precisa
        //https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        return data.toISOString().slice(0, 10);
    }


    // public static formata_dataString_para_formato_data(data:string){
    public formata_data_e_talvez_hora_hhmmss(dt: Date | string): string {

        let decodifica_data = DataUtils.decodifica_data(dt);
        if (!decodifica_data.sucesso)
            return "";
        let s = DataUtils.formatarTela(dt);

        let decodifica_hora = DataUtils.decodifica_hora(dt);

        if (decodifica_hora.sucesso &&
            (decodifica_hora.hora != "00" || decodifica_hora.min != "00" || decodifica_hora.seg != "00")) {
            s = s + " " + decodifica_hora.hora + ":" + decodifica_hora.min + ":" + decodifica_hora.seg;

        }
        return s;
    }

    //     ' ------------------------------------------------------------------------
    // '	FORMATA_DATA_E_TALVEZ_HORA_HHMM
    // '	Formata a data e hora (se houver hora): DD/MM/YYYY HH:NN
    // '	Senão será apenas a data: DD/MM/YYYY
    // '	Lembrando que mesmo que a informação referente aos segundos não
    // '	seja exibida, o fato desse campo ser diferente de zero significa
    // '	que há informação sobre o horário armazenado.
    public formata_data_e_talvez_hora_hhmm(dt: Date | string): string {

        let decodifica_data = DataUtils.decodifica_data(dt);
        if (!decodifica_data.sucesso)
            return "";
        let s = DataUtils.formatarTela(dt);

        let decodifica_hora = DataUtils.decodifica_hora(dt);

        if (decodifica_hora.sucesso &&
            (decodifica_hora.hora != "00" || decodifica_hora.min != "00" || decodifica_hora.seg != "00")) {
            s = s + " " + decodifica_hora.hora + ":" + decodifica_hora.min;

        }
        return s;

    }



    public static formata_dataString_para_formato_data(data: string) {
        let split = data.split('/');
        let dia: string;
        let mes: string;
        let ano: string;
        let retorno: string;
        if (split.length == 3) {
            retorno = split[2] + "-" + split[1] + "-" + split[0];
        }

        return retorno;
    }

    public static formata_formulario_date(data: string): Date {
        if (!data)
            return;

        const aux = new Date();
        const hhmmss = " 00:00:00";
        const dt = new Date(data = data + hhmmss);
        dt.setHours(aux.getHours());
        dt.setMinutes(aux.getMinutes());
        dt.setSeconds(aux.getSeconds());

        return dt;
    }

    public formata_data_DDMMYYY(data: any): any {
        if (!data)
            return;

        let split = data.split('-');
        return split[2].substring(0, 2) + "/" + split[1] + "/" + split[0];
    }
    public static validarData(data: Date): boolean {
        if (isNaN(data.getTime())) return false;
        return true;
    }
    public static somarDias(data: Date, dias: number): Date {
        //define a data de 60 dias para trás
        //https://stackoverflow.com/questions/563406/add-days-to-javascript-date
        let ms = data.getTime() + (86400000 * dias);
        return new Date(ms);
    }
    public static formatarTela(data: Date | string): string {
        //para imprimir na tela
        //está vindo como string do c#!
        if (!data) {
            return "";
        }
        if (data.toString() === "0001-01-01T00:00:00") {
            return "";
        }
        //temos um problema com a data de busca, pois esta ao fazer 
        const aux = Date.parse(data.toString());
        if (!aux)
            return "";
        const aux2 = new Date(aux);
        if (!aux2)
            return "";
        return DataUtils.dataLocal(aux2);
    }

    public static dataLocal(data: Date): string {
        let dia = data.getDate().toString(),
            diaF = (dia.length == 1) ? '0' + dia : dia,
            mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
            mesF = (mes.length == 1) ? '0' + mes : mes,
            anoF = data.getFullYear();
        return diaF + "/" + mesF + "/" + anoF;
    }

    public static formatarTelaHora(data: Date | string): string {
        //para imprimir na tela
        //está vindo como string do c#!
        if (!data) {
            return "";
        }
        if (data.toString() === "0001-01-01T00:00:00") {
            return "";
        }
        const aux = Date.parse(data.toString());
        if (!aux)
            return "";
        const aux2 = new Date(aux);
        if (!aux2)
            return "";
        return DataUtils.dataLocal(aux2);
    }

    public static formatarTelaHoraSemSegundos(data: Date | string): string {
        //para imprimir na tela
        //está vindo como string do c#!
        if (!data) {
            return "";
        }
        if (data.toString() === "0001-01-01T00:00:00") {
            return "";
        }
        const aux = Date.parse(data.toString());
        if (!aux)
            return "";
        const aux2 = new Date(aux);
        if (!aux2)
            return "";
        const ret = aux2.toLocaleTimeString(); //DataUtils.dataLocal(aux2);
        return ret.substr(0, ret.length - 3);
    }

    public static formatarTelaHoraComSegundos(data: Date | string): string {
        //para imprimir na tela
        //está vindo como string do c#!

        if (!data) {
            return "";
        }
        if (data.toString() === "0001-01-01T00:00:00") {
            return "";
        }
        const aux = Date.parse(data.toString());
        if (!aux)
            return "";
        const aux2 = new Date(aux);
        if (!aux2)
            return "";
        const ret = aux2.toLocaleTimeString(); //DataUtils.dataLocal(aux2);
        return ret;
    }

    public static formatarTelaDataeHora(data: Date | string): string {
        return this.formatarTela(data) + this.formatarTelaHora(data);

    }
    //     ' ------------------------------------------------------------------------
    // '	FORMATA_DATA_E_TALVEZ_HORA_HHMM
    // '	Formata a data e hora (se houver hora): DD/MM/YYYY HH:NN
    // '	Senão será apenas a data: DD/MM/YYYY
    // '	Lembrando que mesmo que a informação referente aos segundos não
    // '	seja exibida, o fato desse campo ser diferente de zero significa
    // '	que há informação sobre o horário armazenado.
    public static formata_data_e_talvez_hora_hhmm(dt: Date | string): string {

        let decodifica_data = DataUtils.decodifica_data(dt);
        if (!decodifica_data.sucesso)
            return "";
        let s = DataUtils.formatarTela(dt);

        let decodifica_hora = DataUtils.decodifica_hora(dt);

        if (decodifica_hora.sucesso &&
            (decodifica_hora.hora != "00" || decodifica_hora.min != "00" || decodifica_hora.seg != "00")) {
            s = s + " " + decodifica_hora.hora + ":" + decodifica_hora.min;

        }
        return s;

    }

    public static formata_data_e_talvez_hora_hhmmss(dt: Date | string): string {

        let decodifica_data = DataUtils.decodifica_data(dt);
        if (!decodifica_data.sucesso)
            return "";
        let s = DataUtils.formatarTela(dt);

        let decodifica_hora = DataUtils.decodifica_hora(dt);

        if (decodifica_hora.sucesso &&
            (decodifica_hora.hora != "00" || decodifica_hora.min != "00" || decodifica_hora.seg != "00")) {
            s = s + " " + decodifica_hora.hora + ":" + decodifica_hora.min + ":" + decodifica_hora.seg;

        }
        return s;

    }
    // ' ------------------------------------------------------------------------
    // '   DECODIFICA_DATA
    // '   Desmembra a data e retorna os respectivos valores para dia, mês e ano.
    public static decodifica_data(dt1: Date | string): decodifica_data_retorno {

        let decodifica_data = new decodifica_data_retorno();
        decodifica_data.sucesso = false;

        decodifica_data.dia = "";
        decodifica_data.mes = "";
        decodifica_data.ano = "";

        if (!dt1)
            return decodifica_data;
        const aux = Date.parse(dt1.toString());
        if (!aux)
            return decodifica_data;
        const aux2 = new Date(aux);
        if (!aux2)
            return decodifica_data;

        let dt2 = aux2;

        // '   DIA
        decodifica_data.dia = dt2.getDate().toString();
        if (decodifica_data.dia.length == 1)
            decodifica_data.dia = "0" + decodifica_data.dia;

        //'   MÊS
        //The getMonth() method returns the month (from 0 to 11) for the specified date,
        decodifica_data.mes = (dt2.getMonth() + 1).toString();
        if (decodifica_data.mes.length == 1)
            decodifica_data.mes = "0" + decodifica_data.mes;

        //'   ANO
        decodifica_data.ano = dt2.getFullYear().toString();
        //já retorna com 4 dígitos

        decodifica_data.sucesso = true;
        return decodifica_data;
    }



    // ' --------------------------------------------------------------------------
    // '   DECODIFICA_HORA
    // '   Desmembra a data e retorna os respectivos valores para hora, min e seg.
    public static decodifica_hora(dt1: Date | string): decodifica_hora_retorno {

        let decodifica_hora = new decodifica_hora_retorno();
        decodifica_hora.sucesso = false;
        decodifica_hora.hora = "";
        decodifica_hora.min = "";
        decodifica_hora.seg = "";

        if (!dt1)
            return decodifica_hora;
        const aux = Date.parse(dt1.toString());
        if (!aux)
            return decodifica_hora;
        const aux2 = new Date(aux);
        if (!aux2)
            return decodifica_hora;

        let dt2 = aux2;
        //'   HORA
        decodifica_hora.hora = dt2.getHours().toString();
        if (decodifica_hora.hora.length == 1)
            decodifica_hora.hora = "0" + decodifica_hora.hora;

        //'   MINUTO
        decodifica_hora.min = dt2.getMinutes().toString();
        if (decodifica_hora.min.length == 1)
            decodifica_hora.min = "0" + decodifica_hora.min;

        //'   SEGUNDO
        decodifica_hora.seg = dt2.getSeconds().toString();
        if (decodifica_hora.seg.length == 1)
            decodifica_hora.seg = "0" + decodifica_hora.seg;

        decodifica_hora.sucesso = true;
        return decodifica_hora;
    }

    public static formata_yyyy_mm_dd_hh_mm_ss(data: Date): string {
        let yyyy_mm_dd = DataUtils.formataParaFormulario(data);
        let hora = data.getHours();
        let min = data.getMinutes();
        let ss = data.getSeconds();
        return yyyy_mm_dd + "_" + hora + "-" + min + "-" + ss;
    }

    public static dataLocalParaArquivo(data: Date): string {
        let dia = data.getDate().toString(),
            diaF = (dia.length == 1) ? '0' + dia : dia,
            mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
            mesF = (mes.length == 1) ? '0' + mes : mes,
            anoF = data.getFullYear(),
            hora = (data.getHours()).toString(),
            horaF = (hora.length == 1) ? '0' + hora: hora,
            min = (data.getMinutes()).toString(),
            minF = (min.length == 1) ? '0' + min : min;
        return `${anoF}${mesF}${diaF}_${horaF}${minF}`;
    }
}
