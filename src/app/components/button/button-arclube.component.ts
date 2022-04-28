import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'button-arclube',
	templateUrl: './button-arclube.component.html',
	styleUrls: ['./button-arclube.component.scss']
})
export class ButtonArClubeComponent {
  type: string = "button"
  label: string
  disabled: boolean = false
  text: string = ''
  icon: string = ''

  @Output() value = new EventEmitter() 

  @Input()
  set setType(value: string) {
    this.type = value
  }

  @Input()
  set setLabel(value: string) {
    this.label = value
  }

  @Input() 
  set isDisabled(value: boolean) {
    this.disabled = value
  }

  @Input()
  set setBtnText(value: boolean){
    if(value)
      this.text = '-text'
  }

  @Input()
  set setIcon(value: string){
    this.icon = value
  }

  returnValue() {
    this.value.emit(true)
  }
}