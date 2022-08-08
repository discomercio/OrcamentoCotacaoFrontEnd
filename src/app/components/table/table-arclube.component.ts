import { Component, Input, Output, EventEmitter } from '@angular/core';
// import {PaymentEnum} from '@app/enums/paymentEnum';

@Component({
  selector: 'table-arclube',
  templateUrl: './table-arclube.component.html',
  styleUrls: ['./table-arclube.component.scss']
})
export class TableArClubeComponent {
  items: any[]
  headers: any[]
  selectedItem: any
  filters: any[]
  titleLabel: string
  isSelection: boolean = false
  haveActions: boolean = false
  isEditItem: boolean = false
  isDeleteItem: boolean = false
  isSortable: boolean = false
  isNew: boolean = false
  statusType: string
  totalRecords: any
  rows: any
  isApproves: boolean = false
  tooltipEditLabel: string = 'Editar'
  tooltipRemoveLabel: string = 'Remover'
  viewItem: boolean = false

  @Output() getPagination = new EventEmitter()
  @Output() getItem = new EventEmitter()
  @Output() showItem = new EventEmitter()
  @Output() removeItem = new EventEmitter()
  @Output() approveItem = new EventEmitter()
  @Output() repproveItem = new EventEmitter()

  @Input()
  set setHeaders(value: any[]) {
    this.headers = value
  }

  @Input()
  set setItems(value: any[]) {
    this.items = value
  }

  @Input()
  set setTitleLabel(value: string) {
    this.titleLabel = value
  }

  @Input()
  set setIsSelection(value: boolean) {
    this.isSelection = value
  }

  @Input()
  set setIsEditItem(value: boolean) {
    this.isEditItem = value
  }

  @Input()
  set setIsDeleteItem(value: boolean) {
    this.isDeleteItem = value
  }

  @Input()
  set setIsSortableHeader(value: boolean) {
    this.isSortable = value
  }

  @Input()
  set setStatusType(value: string) {
    this.statusType = value
  }

  @Input()
  set setTotalRows(value: any) {
    this.totalRecords = value
  }

  @Input()
  set setRowsControl(value: any) {
    this.rows = value
  }

  @Input()
  set setApproves(value: boolean) {
    this.isApproves = value
  }

  @Input()
  set setEditLabelTooltip(value: string) {
    this.tooltipEditLabel = value
  }

  @Input()
  set setRemoveLabelTooltip(value: string) {
    this.tooltipRemoveLabel = value
  }

  @Input()
  set isViewItem(value: boolean) {
    this.viewItem = value
  }

  newItem() {

  }

  editItem(item: any) {
    this.getItem.emit(item)
    console.log(item)
  }

  deleteItem(item: any) {
    this.removeItem.emit(item)
  }

  getPage(event: any) {
    this.getPagination.emit(event)
  }

  approve(event: any) {
    this.approveItem.emit(event)
  }

  repprove(event: any) {
    this.repproveItem.emit(event)
  }

  show(event: any) {
    this.showItem.emit(event)
  }

  getColorStatus(value: any) {
    // switch(this.statusType) {
    //   case 'payment': 
    //     switch (value){
    //       case PaymentEnum.Pago:
    //         return 'green'
    //       case PaymentEnum.Pendente:
    //         return 'yellow'
    //       case PaymentEnum.Cancelado:
    //         return 'red'
    //       case PaymentEnum.EmAnalise:
    //         return 'blue'
    //     }
    //     break;
    //   default: 
    //     return 'black'  
    // }
  }
  onRowSelected(value: any) {
    this.getItem.emit(value)
  }
  GetTooltipStatus(value: any) {
    // switch(this.statusType) {
    //   case 'payment': 
    //     switch (value){
    //       case PaymentEnum.Pago:
    //         return 'Pago'
    //       case PaymentEnum.Pendente:
    //         return 'Pendente'
    //       case PaymentEnum.Cancelado:
    //         return 'Cancelado'
    //       case PaymentEnum.EmAnalise:
    //         return 'Em Analise'
    //     }
    //     break;
    //   default: 
    //     return 'black'  
    // }
  }
}