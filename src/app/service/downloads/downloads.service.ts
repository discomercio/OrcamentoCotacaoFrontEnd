import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient) { }

  public buscarToTree():Promise<TreeNode[]>{
    return this.http.get<any>('assets/demo/data/banco/downloads.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  public download():Observable<any>{
    return this.http.get('assets/demo/data/filesystem.json', {responseType: 'blob'});
  }
}
