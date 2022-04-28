import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'radio-arclube',
	templateUrl: './radio-arclube.component.html',
	styleUrls: ['./radio-arclube.component.scss']
})
export class RadioArClubeComponent { 
	titleLabel: string
	valueRadio: string
	valueSend: any
	items: any[]
	isMultiple: boolean = false
	widthContainer: string = '35'
	rowColumn: string = 'column'
	disabled: boolean = false
	fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''

	constructor() { }

	@Output() getItemSelected = new EventEmitter();

	@Input() 
	set titleInput(value: string ){
		this.titleLabel = value
	}

	@Input() 
	set setValueRadio (value: string ) {
		this.valueRadio = value
	}

	@Input()
	set setRadioItems(values: any[]) {
		this.items = values
	}

	@Input()
	set setIsMultiple(value: boolean) {
		this.isMultiple = true
	}

	@Input()
	set setWidthContainer(value: string) {
		this.widthContainer = value
	}

	@Input()
	set setRowColumn(value: string) {
		this.rowColumn = value
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

	@Input() 
	set setDisable(value: boolean ){
		this.disabled = value
	}


	returnValue() {
		this.getItemSelected.emit(this.valueSend)
	}

	getLabelStatus(){
		return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
 }

	ngOnInit() { }
}