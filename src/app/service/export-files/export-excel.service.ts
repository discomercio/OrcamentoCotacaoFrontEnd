import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';


const XLSX_TYPE = 'application / vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset = UTF-8';
const XLSX_EXTENSION = '.xlsx';
const CSV_TYPE = 'text/csv;charset=utf-8';
const CSV_EXTENSION = '.csv';

@Injectable({
  providedIn: 'root'
})

export class ExportExcelService {
  constructor() { }
  dataUtils: DataUtils = new DataUtils();

  public exportAsXLSXFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName, XLSX_TYPE, XLSX_EXTENSION);
  }

  public exportAsCSVFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const csvOutput: string = XLSX.utils.sheet_to_csv(worksheet);
    this.saveAsExcelFile(csvOutput, excelFileName, CSV_TYPE, CSV_EXTENSION);
  }

  private saveAsExcelFile(buffer: any, fileName: string, type: string, extension: string): void {
    const data: Blob = new Blob([buffer], { type: type });
    let dateTime = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString("pt-br").slice(0, 10));
    FileSaver.saveAs(data, fileName + '_' + dateTime + extension);
  }
}
