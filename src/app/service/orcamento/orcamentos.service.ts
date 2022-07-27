import { OrcamentoCotacaoDto } from './../../dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { ValidadeOrcamento } from '../../dto/config-orcamento/validade-orcamento';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { RemetenteDestinatarioResponse } from '../mensageria/remetenteDestinatarioResponse';
import { MensagemDto } from 'src/app/dto/MensagemDto';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) { }

  buscarRegistros(filtro: any): Observable<ListaDto[]> {
    return this.http.post<ListaDto[]>(`${environment.apiUrl}Orcamento/porfiltro`, filtro);
  }

  buscarStatus(origem: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Orcamento/Status?origem=${origem}`);
  }

  buscarOrcamento(id: number): Observable<OrcamentoCotacaoResponse> {
    return this.http.get<OrcamentoCotacaoResponse>(`${environment.apiUrl}Orcamento?id=${id}`);
  }

  enviarOrcamento(model: OrcamentoCotacaoResponse): Observable<number> {
    return this.http.post<number>(`${environment.apiUrl}Orcamento`, model);
  }

  atualizarDadosOrcamento(orcamento:OrcamentoCotacaoResponse): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}Orcamento/atualizarDados`, orcamento);
  }

  buscarConfigValidade(): Observable<ValidadeOrcamento> {
    return this.http.get<ValidadeOrcamento>(`${environment.apiUrl}Orcamento/validade`);
  }

  buscarDadosParaMensageria(idOrcamentoCotacao: number, usuarioIterno: boolean): Observable<RemetenteDestinatarioResponse> {
    return this.http.get<RemetenteDestinatarioResponse>(`${environment.apiUrl}Orcamento/buscarDadosParaMensageria?idOrcamento=${idOrcamentoCotacao}&usuarioInterno=${usuarioIterno}`);
  }

  prorrogarOrcamento(id: number): Observable<MensagemDto> {
    return this.http.post<MensagemDto>(`${environment.apiUrl}Orcamento/${id}/prorrogar`, id);
  }
  atualizarOrcamentoOpcao(opcao: OrcamentosOpcaoResponse): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}Orcamento/atualizarOrcamentoOpcao`, opcao);
  }

  verificarUsoDeAlcada(idOrcamento:number):Observable<number>{
    return this.http.get<number>(`${environment.apiUrl}Orcamento/verificarUsoDeAlcada?idOrcamento=${idOrcamento}`);
  }
}
