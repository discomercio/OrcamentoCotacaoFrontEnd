import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'menu-dropdown-arclube',
	templateUrl: './menu-dropdown-arclube.component.html',
	styleUrls: ['./menu-dropdown-arclube.component.scss']
})
export class MenuDropdownArClubeComponent {
	widthContainer: any = 100
	containerItem: string = '100%'
	headers: any[]
	header: any

	constructor() { }

  @Input()
  set setMultipleHeadersMenu(value: any[]){
    this.headers = value
  }
  
	@Input()
  set setSingleHeadersMenu(value: any[]){
    this.header = value
  }
}