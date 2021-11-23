import { Injectable, DebugElement } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { Observable } from 'rxjs';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { environment } from 'src/environments/environment';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) { }

  buscarListaOrcamento(): Observable<ListaDto[]> {
    //incluir parametros para filtrar
    return this.http.get<ListaDto[]>(environment.apiUrl + 'Orcamento');
  }

  buscarOrcamento(id: number): Observable<OrcamentoCotacaoDto[]> {
    return this.http.get<OrcamentoCotacaoDto[]>(environment.apiUrl + "Orcamento")
  }

  enviarOrcamento(opcoesOrcamento:OrcamentoCotacaoDto){
    return this.http.post<OrcamentoCotacaoDto>(environment.apiUrl + "Orcamento", opcoesOrcamento);
  }

  criarOrcamento(cliente:ClienteOrcamentoCotacaoDto){
    return this.http.post<ClienteOrcamentoCotacaoDto>(environment.apiUrl + "Orcamento", cliente);
  }
}
