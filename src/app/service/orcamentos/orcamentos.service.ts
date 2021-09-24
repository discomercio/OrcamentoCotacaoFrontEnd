import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http:HttpClient) { }

  buscarListaOrcamento(): Observable<ListaDto[]> {
    return this.http.get<ListaDto[]>('assets/demo/data/banco/lista-orcamentos.json');
  }
}
