import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient) { }

  public urlUpload: string = `${environment.apiUrl}v1/arquivo/upload`;

  public buscarToTree():Promise<TreeNode[]>{
    return this.http.get<any>(`${environment.apiUrl}v1/arquivo/obterestrutura`)
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  public download(id: any):Observable<any>{
    return this.http.get(`${environment.apiUrl}v1/arquivo/download/${id}`, {responseType: 'blob'});
  }

  public excluir(id: any):Observable<any>{
    return this.http.post(`${environment.apiUrl}v1/arquivo/excluir/${id}`, id);
  }

  public editar(id:string, nome:string, descricao:string){
    return this.http.put(`${environment.apiUrl}v1/arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id);
  }

  // public enviar(arquivo:string){
  //   return this.http.post(`${environment.apiUrl}v1/arquivo/upload`, arquivo);
  // }

  public novaPasta(nome:string, idpai:string){
    return this.http.post(`${environment.apiUrl}v1/arquivo/criarpasta?nome=${nome}&idpai=${idpai}`, nome);
  }
}
