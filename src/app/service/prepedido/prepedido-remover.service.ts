import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PrepedidoRemoverService {

  constructor(private readonly http: HttpClient, private env: environment) { }

  public remover(numeroPrePedido: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.env.apiUrl()}api/Prepedido/removerPrePedido/`+ numeroPrePedido, numeroPrePedido);
  }
}