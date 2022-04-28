import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'picklist-arclube',
  templateUrl: './picklist-arclube.component.html',
  styleUrls: ['./picklist-arclube.component.scss']
})
export class PicklistArClubeComponent {
  sourceLabel: string = ""
  targetLabel: string = ""

  sourceItems: any[]
  targetItems: any[] = []
  fieldName: string = ""

  disabled: any = false
  fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''

  constructor() { }

  ngOnInit() { }
  @Output() getItemSelected = new EventEmitter();

  @Input()
  set inputItems(value: any[]) {
    this.sourceItems = value
  }

  @Input()
  set setSourceLabel(value: string) {
    this.sourceLabel = value
  }

  @Input()
  set setTargetLabel(value: string) {
    this.targetLabel = value
  }

  @Input()
  set setFieldName(value: string){
    this.fieldName = value
  }

  @Input()
  set setDisabled(value: boolean){
    this.disabled = value
  }

  @Input()
  set setTargetValue(value: []){
    this.targetItems = value
  }

  @Input()
	set validControl(value: boolean){
		this.fieldValid = value
	}

	@Input()
	set isRequired(value: boolean){
		this.requiredField = value
		this.requiredLabel =  value? '*' : ''
	}

  getLabelStatus(){
    return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
  }
  
  onChange() {
    this.getItemSelected.emit(this.targetItems)
  }
}
