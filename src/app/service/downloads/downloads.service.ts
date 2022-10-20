import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ObterEstruturaResponse } from './../../dto/arquivo/ObterEstruturaResponse';
import { DownloadResponse } from './../../dto/arquivo/DownloadResponse';
import { ArquivoExcluirResponse } from './../../dto/arquivo/ArquivoExcluirResponse';
import { ArquivoEditarResponse  } from './../../dto/arquivo/ArquivoEditarResponse';
import { ArquivoNovaPastaResponse  } from './../../dto/arquivo/ArquivoNovaPastaResponse';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public urlUpload: string = `${this.env.apiUrl()}arquivo/upload`;

  public buscarToTree(): Observable<ObterEstruturaResponse> {
    return this.http.get<ObterEstruturaResponse>(`${this.env.apiUrl()}arquivo/ObterEstrutura`);
  }
  
  public download(id: any) : Observable<DownloadResponse> {
    return this.http.get<DownloadResponse>(`${this.env.apiUrl()}arquivo/download/${id}`);
  }
  
  public excluir(id: any):Observable<ArquivoExcluirResponse>{
     return this.http.post<ArquivoExcluirResponse>(`${this.env.apiUrl()}arquivo/excluir/${id}`, { id: id });
   }
  
  public editar(id:string, nome:string, descricao:string):Observable<ArquivoEditarResponse>{
    return this.http.put<ArquivoEditarResponse >(`${this.env.apiUrl()}arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id);
  }
  
  public novaPasta(nome:string, idpai:string):Observable<ArquivoNovaPastaResponse>{
    return this.http.post<ArquivoNovaPastaResponse>(`${this.env.apiUrl()}arquivo/criarpasta?nome=${nome}&idpai=${idpai}`, nome);
  }
}

