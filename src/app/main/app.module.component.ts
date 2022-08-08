import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {AppModuleNgComponents} from './app.module.ngcomponent'

//Genéric Components


import { InputArClubeComponent } from '../components/input/input-arclube.component'
import { DateArClubeComponent } from '../components/date/date-arclube.component'
import { DropdownArClubeComponent } from '../components/dropdown/dropdown-arclube.component'
import { TextAreaArClubeComponent } from '../components/textarea/textarea-arclube.component'
import { RadioArClubeComponent } from '../components/radioButton/radio-arclube.component'
import { TableArClubeComponent } from '../components/table/table-arclube.component'
import { ModalArClubeComponent } from '../components/modal/modal-arclube.component'
import { AutoCompleteArClubeComponent } from '../components/autocomplete/autocomplete-arclube.component'
import { CheckboxArClubeComponent } from '../components/checkbox/checkbox-arclube.component'
import { PicklistArClubeComponent } from '../components/picklist/picklist-arclube.component'
import { MenuDropdownArClubeComponent } from '../components/menu-dropdown/menu-dropdown-arclube.component'
import { ButtonArClubeComponent } from '../components/button/button-arclube.component'
import { LoadingArClubeComponent } from '../components/loading/loading-arclube.component'
import { HeaderArClubeComponent } from '../components/header/header-arclube.component'
import { SelecionarClienteArClubeComponent } from '../components/selecionar-cliente/selecionar-cliente.component'
import { SelecionarCepArClubeComponent } from '../components/selecionar-cep/selecionar-cep.component'




@NgModule({
  imports: [
    AppModuleNgComponents,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule 
  ],
  declarations: [
    InputArClubeComponent,
    DateArClubeComponent,
    DropdownArClubeComponent,
    TextAreaArClubeComponent,
    RadioArClubeComponent,
    TableArClubeComponent,
    ModalArClubeComponent,
    AutoCompleteArClubeComponent,
    CheckboxArClubeComponent,
    PicklistArClubeComponent,
    MenuDropdownArClubeComponent,
    ButtonArClubeComponent,
    LoadingArClubeComponent,
    HeaderArClubeComponent,
    SelecionarClienteArClubeComponent,
    SelecionarCepArClubeComponent
  ],
  exports: [
    InputArClubeComponent,
    DateArClubeComponent,
    DropdownArClubeComponent,
    TextAreaArClubeComponent,
    RadioArClubeComponent,
    TableArClubeComponent,
    ModalArClubeComponent,
    AutoCompleteArClubeComponent,
    CheckboxArClubeComponent,
    PicklistArClubeComponent,
    MenuDropdownArClubeComponent,
    ButtonArClubeComponent,
    LoadingArClubeComponent,
    HeaderArClubeComponent,
    SelecionarClienteArClubeComponent,
    SelecionarCepArClubeComponent
  ]
})
export class AppModuleComponents { }