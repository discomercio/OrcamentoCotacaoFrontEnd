import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class ValidacaoFormularioService {
    constructor() { }

    public validaForm(form: FormGroup): boolean {
        if (!form.valid) {
            Object.keys(form.controls).forEach(campo => {
                const controle = form.get(campo);
                controle.markAsDirty();
            });
            return false;
        }
        return true;
    }

    public verificaCampo(formGroup: FormGroup, field: string) {
        return !formGroup.get(field).valid && formGroup.get(field).dirty && !formGroup.get(field).disabled;
    }
}