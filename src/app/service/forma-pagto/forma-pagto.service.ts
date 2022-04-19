import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FormaPagtoRequest } from 'src/app/dto/forma-pagto/formaPagtoResquest';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';

@Injectable({
  providedIn: 'root'
})
export class FormaPagtoService {

  constructor(private http: HttpClient) { }

  buscarFormaPagto(tipoCliente: string, comIndicacao: number): Observable<FormaPagto[]> {
    let formaPagtoRequest: FormaPagtoRequest = new FormaPagtoRequest();
    formaPagtoRequest.TipoCliente = tipoCliente;
    formaPagtoRequest.ComIndicacao = comIndicacao;
    return this.http.post<FormaPagto[]>(environment.apiUrl + "FormaPagamento/buscarFormasPagamentos", formaPagtoRequest);
  }

  buscarQtdeMaxParcelaCartaoVisa(): Observable<number> {
    return this.http.get<number>(environment.apiUrl + "FormaPagamento/buscarQtdeMaxPacelas");
  }
}
