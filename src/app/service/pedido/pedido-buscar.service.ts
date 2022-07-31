import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PedidoDto } from 'src/app/dto/pedido/detalhesPedido/PedidoDto2';


@Injectable({
  providedIn: 'root'
})
export class PedidoBuscarService {

  public carregando: boolean = false;
  private pedidos$: Observable<any> = new Observable();

  constructor(private readonly http: HttpClient) { }

  public atualizar(numeroPedido: string): Observable<any> {
    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    params = params.append('numPedido', numeroPedido);
    this.carregando = true;

    this.pedidos$ = Observable.create(observer => {
      this.http.get<PedidoDto>(environment.apiUrl + 'pedido/buscarPedido', { params: params }).toPromise()
        .then(response => {
          if(response)
            this.carregando = false;
          observer.next(response);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        });
    });
    return this.pedidos$;
  }

  
}
