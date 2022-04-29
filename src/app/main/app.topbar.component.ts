import {Component, Input, Output, EventEmitter } from '@angular/core';
import {Router } from '@angular/router';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import { AutenticacaoService } from './../service/autenticacao/autenticacao.service';
import { DropDownItem } from '../views/orcamentos/models/DropDownItem';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Lojas } from '../dto/lojas/lojas';

@Component({
    selector: 'app-topbar',
    templateUrl: "app.topbar.component.html"
})
export class AppTopBarComponent {


    constructor(
        public app: AppComponent,
        public appMain: AppMainComponent,
        private readonly autenticacaoService:  AutenticacaoService,
        private readonly router: Router,
        private fb: FormBuilder
    ) {}

    public form: FormGroup;
    lojas: Array<DropDownItem> = [];

    ngOnInit(): void {
        this.criarForm();
        this.populaComboLojas();
    }

    criarForm() {
    this.form = this.fb.group({
        cboLojas: [''],
    });
    }

    logoffClick() {
        this.autenticacaoService.authLogout();
        this.router.navigate(['/account/login'], { queryParams: {} });
      }

      populaComboLojas() {
          var lojaLogada = sessionStorage.getItem("lojaLogada");
          var lojas = sessionStorage.getItem('lojas');

          if(lojas) {
            lojas.toString().split(',').forEach(x => {
                this.lojas.push({ Id:x, Value:`Loja: ${x}`});
            })
          };

          if(!lojas) {
            if(this.autenticacaoService._lojasUsuarioLogado) {
                this.autenticacaoService._lojasUsuarioLogado.forEach(x => {
                    this.lojas.push({ Id:x, Value:`Loja: ${x}`});
                });
            }
          }

          if(this.lojas.length > 0) {
            if(lojaLogada) {
                this.form.controls.cboLojas.setValue(lojaLogada);
            }
          }

          if(this.lojas.length <= 1) {
            this.form.controls.cboLojas.disable();
          } else {
            this.form.controls.cboLojas.enable();
          }
      }

      cboLojas_onChange($event) {
        sessionStorage.setItem("lojaLogada", $event);
        this.autenticacaoService._lojaLogado = $event;
        this.router.navigateByUrl('/');
        // window.location.reload();
    }
}
