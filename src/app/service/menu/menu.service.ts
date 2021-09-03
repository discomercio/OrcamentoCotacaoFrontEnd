import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from 'primeng/api/menuitem';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  buscar():Observable<any[]>{
    return this.http.get<any[]>('assets/demo/data/banco/menu.json');
  }
}
