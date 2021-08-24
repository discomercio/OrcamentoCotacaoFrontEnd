import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TreeNode } from 'primeng/api/treenode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient) { }

  public buscarOb(): Observable<TreeNode> {
    return this.http.get<TreeNode>('assets/demo/data/files.json');
  }

  public buscar(): Promise<TreeNode[]> {
    return this.http.get<any>('assets/demo/data/files.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }

  public buscarToTree():Promise<TreeNode[]>{
    return this.http.get<any>('assets/demo/data/filesystem.json')
      .toPromise()
      .then(res => res.data as TreeNode[]);
  }
}
