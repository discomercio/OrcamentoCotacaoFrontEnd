import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { CodigoDescricaoRequest } from 'src/app/dto/codigo-descricao/codigo-descricao-request';
import { CodigoDescricaoResponse } from 'src/app/dto/codigo-descricao/codigo-descricao-response';
import { ListaCodigoDescricaoResponse } from 'src/app/dto/codigo-descricao/lista-codigo-descricao-response';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  public carregando: boolean = false;
  private pedidos$: Observable<any> = new Observable();

  constructor(
    private http: HttpClient,
    private appSettingsService: AppSettingsService) { }

  carregar(numeroPedido: any) {

    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    params = params.append('numPedido', numeroPedido);
    this.carregando = true;

    this.pedidos$ = Observable.create(observer => {
      this.http.get<any>(this.appSettingsService.config.apiUrl + 'api/pedido/buscarPedido', { params: params }).toPromise()
        .then(response => {
          if (response)
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

  statusPorFiltro(filtro:CodigoDescricaoRequest):Observable<ListaCodigoDescricaoResponse>{
    return this.http.post<ListaCodigoDescricaoResponse>(`${this.appSettingsService.config.apiUrl}api/Pedido/statusPorFiltro`, filtro);
  }
}
