import {Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'input-arclube',
	templateUrl: './input-arclube.component.html',
	styleUrls: ['./input-arclube.component.css'], encapsulation: ViewEncapsulation.None
})
export class InputArClubeComponent {
	titleLabel: string
	value: string
 	type: string = 'text'
	widthContainer: any =  100
	widthInput: any = 100
	widthTitle: any = 100
	disabled: boolean = false
	invalid: boolean = false
	placeholder: string = ''
	id: string
	mask: string = ''
	feedback: boolean = false
	fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''
	number: number;
	class: string;
	autofocus: boolean = false;

	constructor() { }	

	@Output() inputValue = new EventEmitter();

	@Input()
	set setId(value: string) {
		this.id = value
	}

	@Input() 
	set setDisable(value: boolean ){
		this.disabled = value
	}

	@Input() 
	set setInvalid(value: boolean ){
		this.invalid = value
	}

	@Input() 
	set setPlaceholder(value: string ){
		this.placeholder = value
	}

	@Input() 
	set titleInput(value: string ){
		this.titleLabel = value
	}

	@Input() 
	set typeInput(value: string ) {
    	this.type = value
	}

	@Input() 
	set valueInput(value: string ) {
    	this.value = value
	}

	@Input()
	set setWidthContainer(value: any) {
		this.widthContainer = value
	}

	@Input()
	set setWidthInput(value: any) {
		this.widthInput = value
	}

	@Input()
	set setWidthTitle(value: any) {
		this.widthTitle = value
	}
	
	@Input()
	set setMask(value: any){
		this.mask = value
	}

	@Input()
	set setFeedback(value: boolean){
		this.feedback = value
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
	set setClass(value: string){
		this.class = value
	}

	@Input() 
	set setFocus(value: boolean ){
		this.autofocus = value
	}	
	
	getLabelStatus() {
		if (this.id == 'Login' || this.id == 'Password')
			return "color: white;"

		return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
	}

	returnValue() {
		this.inputValue.emit(this.value)
	}

	ngOnInit() { }
}