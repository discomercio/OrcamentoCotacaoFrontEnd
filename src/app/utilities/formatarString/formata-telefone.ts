import { StringUtils } from './string-utils';

export class FormataTelefone {
    static mascaraTelefone(userInput: string) {
        let numbers = StringUtils.retorna_so_digitos(userInput);
        console.log(numbers);
        debugger;
        if (numbers.length > 10) {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        } else {
            return ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        }
    }
}
