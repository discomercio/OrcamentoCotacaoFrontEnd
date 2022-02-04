import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  buscarRegistros(origem:string): Observable<ListaDto[]> {
    return this.http.get<ListaDto[]>(`${environment.apiUrl}Orcamento?origem=${origem}`);
  }

  buscarStatus(origem:string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Orcamento/Status?origem=${origem}`);
  }

  buscarOrcamento(id: string): Observable<ClienteOrcamentoCotacaoDto> {
    let param = new HttpParams();
    param = param.append("id", id);
    return this.http.get<ClienteOrcamentoCotacaoDto>("src/assets/demo/data/banco/cliente.json");
  }

  enviarOrcamento(opcoesOrcamento:OrcamentoCotacaoDto){
    return this.http.post<OrcamentoCotacaoDto>(`${environment.apiUrl}Orcamento`, opcoesOrcamento);
  }

  criarOrcamento(cliente:ClienteOrcamentoCotacaoDto):Observable<ClienteOrcamentoCotacaoDto>{
    return this.http.post<ClienteOrcamentoCotacaoDto>(`${environment.apiUrl}Orcamento`, cliente);
  }

  atualizarClienteOrcamento(cliente:ClienteOrcamentoCotacaoDto):Observable<ClienteOrcamentoCotacaoDto>{
    return this.http.put<ClienteOrcamentoCotacaoDto>(`${environment.apiUrl}Orcamento`, cliente);
  }
}
