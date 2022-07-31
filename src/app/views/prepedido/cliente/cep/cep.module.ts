import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CepComponent } from './cep/cep.component';
import { CepDialogComponent } from './cep-dialog/cep-dialog.component';
import {
  MatIconModule, MatInputModule, MatButtonModule, MatCardModule,
  MatRadioModule, MatAutocompleteModule, MatCheckbox, MatCheckboxModule, MatTableModule,
  MatSnackBarModule, MatSelectModule, MatStepperModule, MatDialogModule,
  MatPaginatorModule, MatSlideToggleModule, MatFormFieldModule, MatExpansionModule 
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';



@NgModule({
  declarations: [CepComponent, CepDialogComponent],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    TextMaskModule,
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [CepComponent],
  entryComponents: [
    CepDialogComponent
  ]
})
export class CepModule { }
