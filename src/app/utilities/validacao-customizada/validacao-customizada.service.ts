import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacaoCustomizadaService extends Validators{

  compararSenha(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      
      if (control.get('senha') && control.get('confirmacao')) {
        let senha: string = control.get('senha').value;
        const confirmacao: string = control.get('confirmacao').value;
  
        if ((!!senha && !!confirmacao) && (senha.length >= 8 && confirmacao.length >= 8)) {
          if (senha === confirmacao) {
            control.get('confirmacao').setErrors(null);
            return null;
          }
          else {
            control.get('confirmacao').setErrors({ confirmacao: true });
            return { teste: true };
          }
        }
  
      }
      return null;
    }
  }
}
