import { AutenticacaoService } from './../autenticacao/autenticacao.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(
    private readonly http: HttpClient,
    private readonly autenticacaoService: AutenticacaoService
    ) { }

  public urlBase: string = `${environment.apiUrl}api/cliente`;

  public buscarCliente(cpfCnpj:any):Observable<any>{
    return this.http.get(`${this.urlBase}/buscarCliente/${cpfCnpj}`);
  }

  public cadastrarCliente(body:any):Observable<any>{
    return this.http.post<any>(`${this.urlBase}/cadastrarCliente`, body);
  }
}
