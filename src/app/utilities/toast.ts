import { NgxIzitoastService } from 'ngx-izitoast';
import { Injectable } from '@angular/core';
import { eToast } from './enums/etoast';

@Injectable({
  providedIn: 'root'
})
export class Toast {

  constructor(private iziToast: NgxIzitoastService) {}

  showToast(type: eToast, message: string) {
    switch(type) {
      case eToast.error:
        this.iziToast.error({title: message})
        break

      case eToast.info:
        this.iziToast.info({title: message})
        break

      case eToast.success:
        this.iziToast.success({title: message})
        break

      case eToast.warning:
        this.iziToast.warning({title: message})
        break
    } 
  }

  GetErrorsMessage(errors: any[]) {
    return 'Verifique: ' + errors.join(",")
  }
}