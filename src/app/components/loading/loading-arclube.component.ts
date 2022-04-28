import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'loading-arclube',
	templateUrl: './loading-arclube.component.html'
})
export class LoadingArClubeComponent {
	label: string
	subLabel: string

	@Input()
	set setLabel(value: string){
		this.label = value
	}

	@Input()
	set setSubLabel(value: string){
		this.subLabel = value
	}
}
