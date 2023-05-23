import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { ListaQuantidadeMensagemPendenteResponse } from 'src/app/dto/mensageria/lista-quantidade-mensagem-pendente-response';

@Injectable({
  providedIn: 'root'
})
export class MensageriaService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

    obterListaMensagem(idOrcamentoCotacao: string): Observable<MensageriaDto[]> {
    
      let params = new HttpParams();    
          params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
          return this.http.get<MensageriaDto[]>(this.appSettingsService.config.apiUrl + "Mensagem/?IdOrcamentoCotacao=" + idOrcamentoCotacao);
      }

    obterListaMensagemRotaPublica(guid: string): Observable<MensageriaDto[]> {

    let params = new HttpParams();    
        params = params.append("guid", guid);
        return this.http.get<MensageriaDto[]>(this.appSettingsService.config.apiUrl + "Mensagem/publico/?guid=" + guid);
    }        

    obterQuantidadeMensagemPendente() {
      return this.http.get<number[]>(this.appSettingsService.config.apiUrl + "Mensagem/pendente/quantidade");
    }          

    obterQuantidadeMensagemPendentePorLoja():Observable<ListaQuantidadeMensagemPendenteResponse> {
      return this.http.get<ListaQuantidadeMensagemPendenteResponse>(this.appSettingsService.config.apiUrl + "Mensagem/pendente/quantidadePorLoja");
    }  

    enviarMensagem(msg: any): Observable<any> {
        return this.http.post<any>(`${this.appSettingsService.config.apiUrl}Mensagem/`, msg);
    }

    enviarMensagemRotaPublica(msg: any, guid: string): Observable<any> {    

      return this.http.post<any>(`${this.appSettingsService.config.apiUrl}Mensagem/publico?msg=${msg}&guid=${guid}`,msg);
      //return this.http.post<any>(`${this.env.apiUrl()}Mensagem/publico/`, params);
    }


    marcarMensagemComoLida(idOrcamentoCotacao: string): Observable<any> {           
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/marcar/lida?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    
    
    marcarMensagemComoLidaRotaPublica(guid: string): Observable<any> {      
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/publico/marcar/lida?guid=${guid}`, guid);
    }       
    
    marcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/marcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    

    desmarcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/desmarcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }      

}
