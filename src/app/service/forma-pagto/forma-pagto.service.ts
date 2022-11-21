import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormaPagtoRequest } from 'src/app/dto/forma-pagto/formaPagtoResquest';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class FormaPagtoService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  buscarFormaPagto(tipoCliente: string, comIndicacao: number, tipoUsuario:number, apelido:string): Observable<FormaPagto[]> {
    let formaPagtoRequest: FormaPagtoRequest = new FormaPagtoRequest();
    formaPagtoRequest.TipoCliente = tipoCliente;
    formaPagtoRequest.ComIndicacao = comIndicacao;
    formaPagtoRequest.TipoUsuario = tipoUsuario;
    formaPagtoRequest.Apelido = apelido;
    return this.http.post<FormaPagto[]>(this.appSettingsService.config.apiUrl + "FormaPagamento/buscarFormasPagamentos", formaPagtoRequest);
  }

  buscarQtdeMaxParcelaCartaoVisa(): Observable<number> {
    return this.http.get<number>(this.appSettingsService.config.apiUrl + "FormaPagamento/buscarQtdeMaxPacelas");
  }
}
