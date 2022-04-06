import { strict } from 'assert';
import { concat } from 'rxjs/operators';

export class DataUtils {
    public static formataParaFormulario(data: Date): string {
        if (typeof data.toISOString != "function")
            data = new Date(data);
        //queremos o formato yyy-mm-dd, é o que o input date precisa
        //https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
        return data.toISOString().slice(0, 10);
    }
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
}
