import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CpfCnpjUtils } from '../cpfCnpjUtils';
import { DataUtils } from '../formatarString/data-utils';
import { StringUtils } from '../formatarString/string-utils';
import { ValidacoesClienteUtils } from '../validacoesClienteUtils';

@Injectable({
  providedIn: 'root'
})
export class ValidacaoCustomizadaService extends Validators {

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

  cnpj_cpf_ok(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let cpfCnpj: string = control.get("cpfCnpj").value;
      if (!cpfCnpj) return null;
      if (!CpfCnpjUtils.cnpj_cpf_ok(cpfCnpj)) {
        control.get('cpfCnpj').setErrors({ cpfCnpj: true });
        return { retorno: true };
      } else {
        control.get('cpfCnpj').setErrors(null);
        return null;
      }
    }
  }
}
