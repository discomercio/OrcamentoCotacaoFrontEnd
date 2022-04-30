import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoService {

    constructor(private readonly http: HttpClient) { }

    public removerPrePedido(idPedido: string):Observable<any>{
        //TODO: Investigar porque Interceptor não foi chamado para incluir o Header automaticamente
        let headers: { [name: string]: string | string[]; } = { 'X-API-Version': environment.versaoApi };
        return this.http.post(`${environment.apiUrl}api/prepedido/removerPrePedido/${idPedido}`, idPedido, { headers: headers});
    }
  }
