import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ObterEstruturaResponse } from './../../dto/arquivo/ObterEstruturaResponse';
import { DownloadResponse } from './../../dto/arquivo/DownloadResponse';
import { ArquivoExcluirResponse } from './../../dto/arquivo/ArquivoExcluirResponse';
import { ArquivoEditarResponse  } from './../../dto/arquivo/ArquivoEditarResponse';
import { ArquivoNovaPastaResponse  } from './../../dto/arquivo/ArquivoNovaPastaResponse';
import { ArquivoUploadResponse  } from './../../dto/arquivo/ArquivoUploadResponse';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public urlUpload: string = `${this.env.apiUrl()}arquivo/upload`;

  public createGuid() 
  {  
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
        return v.toString(16);  
    });  
  }

  public buscarToTree(): Observable<ObterEstruturaResponse> {

    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

    return this.http.get<ObterEstruturaResponse>(`${this.env.apiUrl()}arquivo/ObterEstrutura`, { 'headers': headers });
    //return this.http.get<ObterEstruturaResponse>(`${this.env.apiUrl()}arquivo/ObterEstrutura`);
  }
  
  public download(id: any) : Observable<DownloadResponse> {

    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

    return this.http.get<DownloadResponse>(`${this.env.apiUrl()}arquivo/download/${id}`, { 'headers': headers });
  }
  
  public excluir(id: any):Observable<ArquivoExcluirResponse>{

    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

     return this.http.post<ArquivoExcluirResponse>(`${this.env.apiUrl()}arquivo/excluir/${id}`, { id: id }, { 'headers': headers });
   }
  
  public editar(id:string, nome:string, descricao:string):Observable<ArquivoEditarResponse>{

    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

    return this.http.put<ArquivoEditarResponse >(`${this.env.apiUrl()}arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id, { 'headers': headers });
  }
  
  public novaPasta(idpai:string, nome:string, descricao:string):Observable<ArquivoNovaPastaResponse> {
    
    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

    return this.http.post<ArquivoNovaPastaResponse>(`${this.env.apiUrl()}arquivo/criarpasta/`, { idPai: idpai, nome: nome, descricao: descricao }, { 'headers': headers });
  }

  public upload(idpai:string, arquivo: any): Observable<ArquivoUploadResponse> {

    let headers: { [name: string]: string | string[]; } = {
      'x-correlation-Id': this.createGuid()
    };

    const formData = new FormData();
    formData.append(arquivo.files[0].name, arquivo.files[0]);

    return this.http.post<ArquivoUploadResponse>(`${this.env.apiUrl()}arquivo/upload/${idpai}`,  
    formData, { 'headers': headers, reportProgress: true });
  }
}

