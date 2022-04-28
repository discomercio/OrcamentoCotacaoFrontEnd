import {Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'modal-arclube',
	templateUrl: './modal-arclube.component.html',
	styleUrls: [ './modal-arclube.component.scss']
})
export class ModalArClubeComponent {
  titleHeader: any
  show: boolean
  width: any
  btnSaveName: string = 'Salvar'
  btnCloseName: string = 'Fechar'
  heightModal: string = '100'
  noSave: boolean = false
  noClose: boolean = false
  overflow: boolean = true
  formName: string
  positionModal: string = 'center'
  fullScreen: boolean = false
  fetchingData: boolean = false

  @Input()
  set setTitleHeader(value: string){
    this.titleHeader = value
  }

  @Input()
  set setShowDialog(value: boolean){
    this.show = value
  }

  @Input()
  set setWidthDialog(value: any){
    this.width = value
  }

  @Input()
  set setBtnSaveName(value: any){
    this.btnSaveName = value
  }

  @Input()
  set setBtnCloseName(value: any){
    this.btnCloseName = value
  }

  @Input()
  set setHeightModal(value: any){
    this.heightModal = value
  }
  
  @Input()
  set setNoSaveBtn(value: boolean){
    this.noSave = value
  }

  @Input()
  set setNoCloseBtn(value: boolean){
    this.noClose = value
  }

  @Input()
  set setNoOverflow(value: boolean){
    this.overflow = value
  }

  @Input()
  set setPosition(value: string){
    this.positionModal = value
  }

  @Input()
  set setFormName(value: string){
    this.formName = value
  }

  @Input()
  set setIsFullScreen(value: boolean){
    this.fullScreen = value
  }

  @Input()
  set setIsLoading(value: boolean){
    this.fetchingData = value
  }

  @Output() closeModal = new EventEmitter()
  @Output() saveAction = new EventEmitter()

  close(event){
   this.closeModal.emit(true)
  }

  save(){
    this.saveAction.emit(true)
   }
}
