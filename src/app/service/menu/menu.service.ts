import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from 'primeng/api/menuitem';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  buscar():Observable<MenuItem[]>{
    return this.http.get<MenuItem[]>('assets/demo/data/banco/menu.json');
  }
}
