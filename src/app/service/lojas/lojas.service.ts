import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lojas } from 'src/app/dto/lojas/lojas';
import { environment } from 'src/environments/environment';
import { PercMaxDescEComissaoResponseViewModel } from './percentual-comissao';

@Injectable({
  providedIn: 'root'
})
export class LojasService {

  constructor(private http: HttpClient) { }

  public buscarTodasLojas(): Observable<Lojas[]> {
    return this.http.get<Lojas[]>(`${environment.apiUrl}Loja`);
  }

  buscarPercentualComissao(loja: string): Observable<PercMaxDescEComissaoResponseViewModel> {
    let params = new HttpParams();
    params = params.append('loja', loja);
    return this.http.get<PercMaxDescEComissaoResponseViewModel>(environment.apiUrl + "Loja/buscarPercMaxPorLoja", { params: params });
  }
}
