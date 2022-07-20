import { StringUtils } from './string-utils';

export class FormataTelefone {
    static mascaraTelefone(){
        return "(00) 0000-0000||(00) 00000-0000";
    }

    public static mascaraTelefoneTexto(userInput: string) {
        let numbers = StringUtils.retorna_so_digitos(userInput);
        if (numbers.length > 10) {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        } else {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        }
    }
    public telefone_formata(telefone: string): string {
        let s_tel = "";
        s_tel = "" + telefone;
        //s_tel = retorna_so_digitos(s_tel)
        s_tel = StringUtils.retorna_so_digitos(s_tel);


        if (!this.telefone_ok(s_tel))
            return "";

        let i = s_tel.length - 4;
        s_tel = s_tel.substr(0, i) + "-" + s_tel.substr(i);

        return s_tel;
    }  

    private telefone_ok(s_tel: string): boolean {
        s_tel = StringUtils.retorna_so_digitos(s_tel);
        if (s_tel.length == 0 || s_tel.length >= 6)
            return true;
        return false;
    }    
}
