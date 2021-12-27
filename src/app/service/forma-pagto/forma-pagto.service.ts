import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormaPagtoService {

  constructor(private http: HttpClient) { }

  // buscarFormaPagto(tipoPessoa:string):Observable<FormaPagtoDto>{
  //   return this.http.get<FormaPagtoDto>("assets/demo/data/banco/lista-forma-pagto.json");
  // }

  buscarQtdeMaxParcelaCartaoVisa():Observable<number>{
    return this.http.get<number>(environment.apiUrl + "FormaPagamento/qtde-parcelas-cartao-visa");
  }
}
