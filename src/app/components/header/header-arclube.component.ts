import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";


@Component({
  selector: 'header-arclube',
  templateUrl: './header-arclube.component.html'
})
export class HeaderArClubeComponent implements OnInit{ 
  headerName: string;
  btnName: string;
  createNew: boolean = false
  constructor() { }

  @Output() getAction = new EventEmitter()

  @Input()
  set setHeaderName(value: string){
    this.headerName = value
  }

  @Input()
  set setBtnName(value: string){
    this.btnName = value
  }

  @Input()
  set setCreateNew(value: boolean){
    this.createNew = value
  }

  returnAction(){
    this.getAction.emit(true)
  }

  ngOnInit() { }
}