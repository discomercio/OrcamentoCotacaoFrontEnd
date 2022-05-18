import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { Usuario } from '../../dto/usuarios/usuario';
import { ValidadeOrcamento } from '../../dto/config-orcamento/validade-orcamento';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { RemetenteDestinatarioResponse } from '../mensageria/remetenteDestinatarioResponse';
@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) {}

  buscarRegistros(filtro:any): Observable<ListaDto[]> {
    return this.http.post<ListaDto[]>(`${environment.apiUrl}Orcamento/porfiltro`, filtro);
  }

  buscarStatus(origem:string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}Orcamento/Status?origem=${origem}`);
  }

  buscarOrcamento(id: number): Observable<OrcamentoCotacaoResponse> {
    return this.http.get<OrcamentoCotacaoResponse>(`${environment.apiUrl}Orcamento?id=${id}`);
  }

  enviarOrcamento(model:OrcamentoCotacaoResponse):Observable<number>{
    return this.http.post<number>(`${environment.apiUrl}Orcamento`, model);
  }

  criarOrcamento(cliente:ClienteOrcamentoCotacaoDto):Observable<ClienteOrcamentoCotacaoDto>{
    return this.http.post<ClienteOrcamentoCotacaoDto>(`${environment.apiUrl}Orcamento`, cliente);
  }

  atualizarClienteOrcamento(cliente:ClienteOrcamentoCotacaoDto):Observable<ClienteOrcamentoCotacaoDto>{
    return this.http.put<ClienteOrcamentoCotacaoDto>(`${environment.apiUrl}Orcamento`, cliente);
  }

  buscarConfigValidade():Observable<ValidadeOrcamento>{
    return this.http.get<ValidadeOrcamento>(`${environment.apiUrl}Orcamento/validade`);
  }

  buscarDadosParaMensageria(idOrcamentoCotacao:number, usuarioIterno:boolean):Observable<RemetenteDestinatarioResponse>{
    return this.http.get<RemetenteDestinatarioResponse>(`${environment.apiUrl}Orcamento/buscarDadosParaMensageria?idOrcamento=${idOrcamentoCotacao}&usuarioInterno=${usuarioIterno}`);
  }
}
