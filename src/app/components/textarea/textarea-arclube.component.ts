import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'textarea-arclube',
	templateUrl: './textarea-arclube.component.html',
	styleUrls: ['./textarea-arclube.component.scss']
})
export class TextAreaArClubeComponent {
	titleLabel: string
	valueText: any
	columns: any = 92
	widthContainer: any  = 160
	rows: any = 4
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
	set setColumns(value: any) {
		this.columns = value
	}

	@Input()
	set setWidthContainer(value: any) {
		this.widthContainer = value
	}

	@Input()
	set setRowsOfArea(value: any) {
		this.rows = value
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

	returnValue() {
		this.getItemSelected.emit(this.valueText)
	}

	getLabelStatus(){
		return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
 }

	ngOnInit() { }
}