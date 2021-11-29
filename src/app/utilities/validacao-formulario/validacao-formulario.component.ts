import { Component, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-validacao-formulario',
})
export class ValidacaoFormularioComponent {

  constructor() { }

  validaForm(form: FormGroup): boolean {
    if (!form.valid) {
      Object.keys(form.controls).forEach(campo => {
        const controle = form.get(campo);
        controle.markAsDirty();
      });
      return false;
    }
    return true;
  }
  
  verificaCampo(formGroup: FormGroup, field: string) {
    return !formGroup.get(field).valid && formGroup.get(field).dirty && !formGroup.get(field).disabled;
  }
}
