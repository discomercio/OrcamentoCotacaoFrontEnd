import {Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment'
@Component({
	selector: 'date-arclube',
	templateUrl: './date-arclube.component.html',
	styleUrls: ['./date-arclube.component.scss']
})
export class DateArClubeComponent {
	titleLabel: string
	selectedItem: any
	minDate: any 
	maxDate =  new Date() 
	date: Date
	widthContainer: any = 170
	containerItem: string = '100%'
	dateFormated: string
	viewType: string 
	fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''
	disabled: boolean = false

	constructor() { }

	@Output() getItemSelected = new EventEmitter();

	@Input() 
	set titleInput(value: string ){
		this.titleLabel = value
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
	set setDateFormated(value: string ) {
    	this.dateFormated = value
	}

	@Input()
	set setTypeView(value: string) {
		this.viewType = value
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
	set setReset(value: any){
		this.date = value
	}

	@Input()
	set valueInput(value: any) {
		if (value)
			this.selectedItem = new Date(value)
	}

	@Input()
	set setDisabled(value: boolean) {
		 this.disabled = value
	}

	returnValue() {
		this.getItemSelected.emit(moment(this.selectedItem).format('DD-MM-YYYYTHH:mm:ss'))
	}

	getLabelStatus(){
		return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
 }

	ngOnInit() { }
}