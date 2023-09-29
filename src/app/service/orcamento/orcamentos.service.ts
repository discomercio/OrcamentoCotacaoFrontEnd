import { OrcamentoCotacaoDto } from './../../dto/orcamentos/opcoes-orcamento-cotacao-dto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { ListaDto } from 'src/app/dto/orcamentos/lista-dto';
import { OrcamentoCotacaoListaResponse } from 'src/app/dto/orcamentos/lista-dto';
import { ValidadeOrcamento } from '../../dto/config-orcamento/validade-orcamento';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { RemetenteDestinatarioResponse } from '../mensageria/remetenteDestinatarioResponse';
import { MensagemDto } from 'src/app/dto/MensagemDto';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { CadastroOrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/CadastroOrcamentoCotacaoResponse';
import { AtualizarOrcamentoOpcaoResponse } from 'src/app/dto/orcamentos/AtualizarOrcamentoOpcaoResponse';
import { ExcluirOrcamentoResponse } from 'src/app/dto/orcamentos/excluir-orcamento-response';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { RelatorioItensOrcamento } from 'src/app/dto/orcamentos/relatorio-itens-orcamento';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  buscarRegistros(filtro: any): Observable<OrcamentoCotacaoListaResponse> {
    return this.http.post<OrcamentoCotacaoListaResponse>(`${this.appSettingsService.config.apiUrl}Orcamento/porfiltro`, filtro);
  }

  buscarStatus(origem: string): Observable<any> {
    return this.http.get<any>(`${this.appSettingsService.config.apiUrl}Orcamento/Status?origem=${origem}`);
  }

  buscarOrcamento(id: number): Observable<OrcamentoCotacaoResponse> {
    return this.http.get<OrcamentoCotacaoResponse>(`${this.appSettingsService.config.apiUrl}Orcamento?id=${id}`);
  }

  enviarOrcamento(model: OrcamentoCotacaoResponse): Observable<CadastroOrcamentoCotacaoResponse> {
    return this.http.post<CadastroOrcamentoCotacaoResponse>(`${this.appSettingsService.config.apiUrl}Orcamento`, model);
  }

  atualizarDadosOrcamento(orcamento: OrcamentoCotacaoResponse): Observable<OrcamentoCotacaoResponse> {
    return this.http.post<OrcamentoCotacaoResponse>(`${this.appSettingsService.config.apiUrl}Orcamento/atualizarDados`, orcamento);
  }



  buscarConfigValidade(loja: string): Observable<ValidadeOrcamento> {
    return this.http.get<ValidadeOrcamento>(`${this.appSettingsService.config.apiUrl}Orcamento/validade?lojaLogada=${loja}`);
  }

  buscarDadosParaMensageria(idOrcamentoCotacao: number, usuarioIterno: boolean): Observable<RemetenteDestinatarioResponse> {
    return this.http.get<RemetenteDestinatarioResponse>(`${this.appSettingsService.config.apiUrl}Orcamento/buscarDadosParaMensageria?idOrcamento=${idOrcamentoCotacao}&usuarioInterno=${usuarioIterno}`);
  }

  prorrogarOrcamento(id: number, lojaLogada: string): Observable<MensagemDto> {
    return this.http.post<MensagemDto>(`${this.appSettingsService.config.apiUrl}Orcamento/${id}/prorrogar?lojalogada=${lojaLogada}`, id);
  }

  cancelarOrcamento(id: number): Observable<MensagemDto> {
    return this.http.put<MensagemDto>(`${this.appSettingsService.config.apiUrl}Orcamento/${id}/status/2`, id);
  }

  reenviarOrcamento(id: number): Observable<MensagemDto> {
    return this.http.put<MensagemDto>(`${this.appSettingsService.config.apiUrl}Orcamento/${id}/reenviar`, id);
  }

  buscarParametros(idCfgParametro: any, lojaLogada: string, origem: string): Observable<any> {
    if (origem == "publico")
      return this.http.get<any>(`${this.appSettingsService.config.apiUrl}publico/parametros?lojalogada=${lojaLogada}&idCfgParametro=${idCfgParametro}`);
    
      return this.http.get<any>(`${this.appSettingsService.config.apiUrl}Orcamento/parametros?lojalogada=${lojaLogada}&idCfgParametro=${idCfgParametro}`);
  }

  atualizarOrcamentoOpcao(opcao: OrcamentosOpcaoResponse): Observable<AtualizarOrcamentoOpcaoResponse> {
    return this.http.put<AtualizarOrcamentoOpcaoResponse>(`${this.appSettingsService.config.apiUrl}Orcamento/atualizarOrcamentoOpcao`, opcao);
  }

  verificarUsoDeAlcada(idOrcamento: number): Observable<number> {
    return this.http.get<number>(`${this.appSettingsService.config.apiUrl}Orcamento/verificarUsoDeAlcada?idOrcamento=${idOrcamento}`);
  }

  aprovarOrcamento(aprovacaoDto: AprovacaoOrcamentoDto, origem: string): Observable<string[]> {
    if (origem == "publico")
      return this.http.post<string[]>(`${this.appSettingsService.config.apiUrl}publico/aprovarOrcamento`, aprovacaoDto);
    else
    return this.http.post<string[]>(`${this.appSettingsService.config.apiUrl}Orcamento/aprovarOrcamento`, aprovacaoDto);
  }

  excluirOrcamento(orcamento:OrcamentoCotacaoResponse):Observable<ExcluirOrcamentoResponse>{
    return this.http.post<ExcluirOrcamentoResponse>(`${this.appSettingsService.config.apiUrl}Orcamento/excluir`, orcamento);
  }

  anularOrcamento(orcamento:OrcamentoCotacaoResponse):Observable<any>{
    return this.http.post<any>(`${this.appSettingsService.config.apiUrl}Orcamento/anular`, orcamento)
  }

  buscarRelatorioItensOrcamento(filtro: Filtro): Observable<RelatorioItensOrcamento> {
    return this.http.post<RelatorioItensOrcamento>(`${this.appSettingsService.config.apiUrl}Relatorios/relatorioItensOrcamento`, filtro);
  }
}
