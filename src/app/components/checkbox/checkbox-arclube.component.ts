import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "checkbox-arclube",
    templateUrl: "./checkbox-arclube.component.html",
    styleUrls: ["./checkbox-arclube.component.scss"],
})
export class CheckboxArClubeComponent {
    titleLabel: string;
    checked: boolean = false;
    disabled: boolean = false;
    fieldValid: boolean = true
	requiredField: boolean = false
	requiredLabel: string = ''
    id:string = ""
    
    @Output() checkedValue = new EventEmitter();


    @Input()
    set setId(value: string) {
        this.id = value;
    }

    @Input()
    set setTitleLabel(value: string) {
        this.titleLabel = value;
    }

    @Input() 
	set setDisable(value: boolean ){
		this.disabled = value
	}

    @Input()
    set setChecked(value: string) {
        this.checked = value === "1"? true : false
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
        this.checkedValue.emit(this.checked);
    }

    getLabelStatus(){
        return this.fieldValid? "color: black; opacity: 0.7px;" : "color: red"
   }
}
