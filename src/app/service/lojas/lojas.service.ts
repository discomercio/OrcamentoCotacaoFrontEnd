import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LojasService {

  constructor(private http: HttpClient) { }

  buscarTodasLojas(): Observable<Lojas[]> {
    return this.http.get<Lojas[]>(environment.apiUrl + 'Loja/BuscarLojas');
    //return this.http.get<Lojas[]>(//'assets/demo/data/banco/lojas.json');
  }
}
