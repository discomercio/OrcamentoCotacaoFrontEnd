import { strict } from 'assert';
import { concat } from 'rxjs/operators';

export class DataUtils {
    public static formata_dataString_para_formato_data(data:string){
        let split = data.split('/');
        let dia:string;
        let mes:string;
        let ano:string;
        let retorno:string;
        if(split.length == 3){
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
        return split[2].substring(0,2) + "-" + split[1] + "-" + split[0];
    }
}
