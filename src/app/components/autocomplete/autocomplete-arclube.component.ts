import {Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
	selector: 'autocomplete-arclube',
	templateUrl: './autocomplete-arclube.component.html',
	styleUrls: ['./autocomplete-arclube.component.scss']
})
export class AutoCompleteArClubeComponent {
  titleLabel: string;
	items: any[];
  selectedItem: any;
  filteredItem: Array<any> = [];
	widthContainer: any =  160
	fieldName: any;

	constructor() { }

	@Output() selectedValue = new EventEmitter();
	@Output() searchItem = new EventEmitter();

	@Input() 
	set titleInput(value: string ){
		this.titleLabel = value
	}

  @Input()
  set setItems(value: any[]){
    this.items = value
  }

	@Input()
	set setWidthContainer(value: any) {
		this.widthContainer = value
	}

	@Input()
	set setSuggestions(value: any){
		this.filteredItem = value
	}

	@Input()
	set setFieldName(value: any){
		this.fieldName = value
	}
	
  search(value: any) {
		this.searchItem.emit(value);
  }

	returnValue() {
		this.selectedValue.emit(this.selectedItem)
	}

	ngOnInit() { }
}