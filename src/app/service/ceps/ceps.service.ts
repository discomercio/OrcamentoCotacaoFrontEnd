import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from 'src/app/dto/ceps/estado';

@Injectable({
  providedIn: 'root'
})
export class CepsService {

  constructor(private http:HttpClient) { }

  buscarEstados():Observable<Estado[]>{
    return this.http.get<Estado[]>('assets/demo/data/banco/estados.json');
  }
}
