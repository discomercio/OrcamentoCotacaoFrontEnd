import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http:HttpClient) { }

  buscarListaPedidos():Observable<ListaDto[]>{
    return this.http.get<ListaDto[]>('assets/demo/data/banco/lista-pedidos.json');
  }
}
