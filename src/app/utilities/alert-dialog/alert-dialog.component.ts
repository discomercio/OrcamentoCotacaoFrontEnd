import { Component, Inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, DynamicDialogInjector } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent {

  constructor(public ref:DynamicDialogRef,
    @Inject(DynamicDialogConfig) public data:DynamicDialogConfig) {
     }


  fechar(){
    this.ref.close();
  }
}
