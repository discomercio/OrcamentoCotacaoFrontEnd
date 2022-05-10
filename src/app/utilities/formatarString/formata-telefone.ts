import { StringUtils } from './string-utils';

export class FormataTelefone {
    static mascaraTelefone(){
        return "(00) 0000-0000||(00) 00000-0000";
    }

    static mascaraTelefoneTexto(userInput: string) {
        let numbers = StringUtils.retorna_so_digitos(userInput);
        if (numbers.length > 10) {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        } else {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        }
    }
}
