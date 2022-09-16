import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { environment } from 'src/environments/environment';
import { PercMaxDescEComissaoResponseViewModel } from '../../dto/percentual-comissao';
import { lojaEstilo } from 'src/app/dto/lojas/lojaEstilo';

@Injectable({
  providedIn: 'root'
})
export class LojasService {

  constructor(private http: HttpClient, private env: environment) { }

  public buscarTodasLojas(): Observable<Lojas[]> {
    return this.http.get<Lojas[]>(`${this.env.apiUrl()}Loja`);
  }

  buscarPercentualComissao(loja: string, tipoCliente:string): Observable<PercMaxDescEComissaoResponseViewModel> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    params = params.append('tipoCliente', tipoCliente);
    return this.http.get<PercMaxDescEComissaoResponseViewModel>(this.env.apiUrl() + "Loja/buscarPercMaxPorLoja", { params: params });
  }

  public buscarLojaEstilo(loja: string): Observable<lojaEstilo> {
    return this.http.get<lojaEstilo>(`${this.env.apiUrl()}loja/${loja}/estilo`);
  }

  public buscarPercentualAlcada(loja:string, tipoCliente:string):Observable<PercMaxDescEComissaoResponseViewModel>{
    let params = new HttpParams();
    params = params.append('loja', loja);
    params = params.append('tipoCliente', tipoCliente);
    return this.http.get<PercMaxDescEComissaoResponseViewModel>(this.env.apiUrl() + "Loja/buscarPercMaxPorLojaAlcada", { params: params });
  }
}
