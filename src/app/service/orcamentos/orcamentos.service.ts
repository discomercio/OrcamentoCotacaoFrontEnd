import { Injectable, DebugElement } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { Observable } from 'rxjs';
import { OpcoesOrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) { }

  buscarListaOrcamento(): Observable<ListaDto[]> {
    //incluir parametros para filtrar
    return this.http.get<ListaDto[]>(environment.apiUrl + 'Orcamento');
  }

  buscarOrcamento(): Observable<OpcoesOrcamentoCotacaoDto[]> {
    return this.http.get<OpcoesOrcamentoCotacaoDto[]>('assets/demo/data/banco/orcamentos-salvos.json')
  }

  enviarOrcamento(opcoesOrcamento:OpcoesOrcamentoCotacaoDto){
    return this.http.post<any[]>(environment.apiUrl + "Orcamento", opcoesOrcamento);
  }
}
