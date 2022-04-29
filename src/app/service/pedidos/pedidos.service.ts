import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';


@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http:HttpClient) { }

  buscarListaPedidos():Observable<OrcamentoCotacaoResponse[]>{
    return this.http.get<OrcamentoCotacaoResponse[]>('assets/demo/data/banco/lista-pedidos.json');
  }
}
