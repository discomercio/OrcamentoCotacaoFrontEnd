import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public urlUpload: string = `${this.env.apiUrl()}arquivo/upload`;

  public buscarToTree():Promise<TreeNode[]>{
    return this.http.get<any>(`${this.env.apiUrl()}arquivo/ObterEstrutura`)
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  public download(id: any):Observable<any>{
    return this.http.get(`${this.env.apiUrl()}arquivo/download/${id}`, {responseType: 'blob'});
  }

  public excluir(id: any):Observable<any>{
    return this.http.post(`${this.env.apiUrl()}arquivo/excluir/${id}`, id);
  }

  public editar(id:string, nome:string, descricao:string):Observable<any>{
    return this.http.put<any>(`${this.env.apiUrl()}arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id);
  }

  public novaPasta(nome:string, idpai:string):Observable<any>{
    return this.http.post<any>(`${this.env.apiUrl()}arquivo/criarpasta?nome=${nome}&idpai=${idpai}`, nome);
  }
}

