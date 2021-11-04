import { Injectable, DebugElement } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { Observable } from 'rxjs';
import { OpcoesOrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) { }

  buscarListaOrcamento(): Observable<ListaDto[]> {
    return this.http.get<ListaDto[]>('assets/demo/data/banco/lista-orcamentos.json');
  }

  buscarOrcamento(): Observable<OpcoesOrcamentoCotacaoDto[]> {
    return this.http.get<OpcoesOrcamentoCotacaoDto[]>('assets/demo/data/banco/orcamentos-salvos.json')
  }
}
