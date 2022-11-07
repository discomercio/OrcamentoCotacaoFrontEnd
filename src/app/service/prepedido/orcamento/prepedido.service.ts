import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoService {

  public carregando: boolean = false;
  private pedidos$: Observable<any> = new Observable();

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) { }
    
  public carregar(numeroPrePedido: string): Observable<any> {

    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    params = params.append('numPrepedido', numeroPrePedido);
    this.carregando = true;

    this.pedidos$ = Observable.create(observer => {
      this.http.get<any>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarPrePedido', { params: params }).toPromise()
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

  public removerPrePedido(idPedido: string):Observable<any>{
    return this.http.post(`${this.appSettingsService.config.apiUrl}api/prepedido/removerPrePedido/${idPedido}`, idPedido);
  }  

  public cadastrarPrePedido(prePedidoDto: any):Observable<any>{
    return this.http.post(`${this.appSettingsService.config.apiUrl}api/prepedido/cadastrarPrePedido`, prePedidoDto);
  }

}
