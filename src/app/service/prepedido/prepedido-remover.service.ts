import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PrepedidoRemoverService {

  constructor(private readonly http: HttpClient) { }
  public remover(numeroPrepedido): Observable<any> {
    return this.http.post(environment.apiUrl + 'prepedido/removerPrePedido/' + numeroPrepedido, numeroPrepedido);
  }

}
