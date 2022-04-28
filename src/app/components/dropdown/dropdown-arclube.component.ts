import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'dropdown-arclube',
	templateUrl: './dropdown-arclube.component.html',
	styleUrls: ['./dropdown-arclube.component.scss']
})
export class DropdownArClubeComponent {
	titleLabel: string
	selectedItem: any
	items: any[]
	widthContainer: any = 100
	containerItem: string = '100%'
	optionsLabel: string = 'name'
	optionsValue: string = 'value'
	Id: string
	fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''
	disabled: any = false;

	constructor() { }

	@Output() getItemSelected = new EventEmitter();

	@Input() 
	set titleInput(value: string ){
		this.titleLabel = value
	}

	@Input() 
	set inputItems(value: any[] ) {
    	this.items = value
	}


	@Input() 
	set setWidthContainer(value: any ) {
    	this.widthContainer = value
	}

	@Input() 
	set setContainerItem(value: string ) {
    	this.containerItem = value
	}

	@Input()
	set setOptionsName(value: string){
		this.optionsLabel = value
	}

	@Input()
	set setOptionsValueName(value: string){
		this.optionsValue = value
	}

	@Input()
	set setReset(value: any) {
		this.selectedItem = value
	}

	@Input() 
	set setDisable(value: boolean ){
		this.disabled = value
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
		this.getItemSelected.emit(this.selectedItem)
	}

	getLabelStatus(){
		return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
 }
 
	ngOnInit() { }
}