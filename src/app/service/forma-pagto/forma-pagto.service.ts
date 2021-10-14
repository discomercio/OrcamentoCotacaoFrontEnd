import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormaPagtoDto } from 'src/app/dto/forma-pagto/forma-pagto-dto';

@Injectable({
  providedIn: 'root'
})
export class FormaPagtoService {

  constructor(private http: HttpClient) { }

  buscarFormaPagto(tipoPessoa:string):Observable<FormaPagtoDto>{
    return this.http.get<FormaPagtoDto>("assets/demo/data/banco/lista-forma-pagto.json");
  }
}
