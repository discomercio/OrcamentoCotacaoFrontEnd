import { StringUtils } from '../formatarString/string-utils';

export class ValidacoesUtils {
    public static email_ok(email: string): boolean {
        let filtro_regex = /^([0-9a-zA-Z]([-.+\w]*[0-9a-zA-Z][_]*)*@([0-9a-zA-Z][-\w]*\.)+[a-zA-Z]{2,9})$/;
        if (!filtro_regex.test(email)) return false;
        return true;
    }

    public static uf_ok(uf: string): boolean {
        //     não vamos fazer pqoue isso será feito pela rotina de preenchimento do CEP
        //mas faemos por enquanto...
        let i, sigla;
        uf = uf.trim().toUpperCase();
        if (uf == "") return true;
        if (uf.length != 2) return false;
        sigla = "AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO    ";
        for (i = 0; i < (sigla.length - 1); i++) {
            if (uf == sigla.substring(i, i + 2)) return true;
        }
        return false;
    }

    public static cep_ok(cep: string): boolean {
        let s_cep;
        s_cep = "" + cep;
        s_cep = StringUtils.retorna_so_digitos(s_cep);
        if ((s_cep.length == 0) || (s_cep.length == 5) || (s_cep.length == 8)) return true;
        return false;
    }
    
}