import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

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

    obterListaMensagemPendente(idOrcamentoCotacao: string): Observable<MensageriaDto[]> {
    
      let params = new HttpParams();    
          params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
          return this.http.get<MensageriaDto[]>(this.appSettingsService.config.apiUrl + "Mensagem/pendente?IdOrcamentoCotacao=" + idOrcamentoCotacao);
      }    

    obterQuantidadeMensagemPendente() {
      return this.http.get<number[]>(this.appSettingsService.config.apiUrl + "Mensagem/pendente/quantidade");
    }          

    enviarMensagem(msg: any): Observable<any> {
        return this.http.post<any>(`${this.appSettingsService.config.apiUrl}Mensagem/`, msg);
    }

    marcarMensagemComoLida(idOrcamentoCotacao: string): Observable<any> {           
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/marcar/lida?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    
    
    marcarMensagemComoLidaRotaPublica(idOrcamentoCotacao: string): Observable<any> {      
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/marcar/lida/publica?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }       
    
    marcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/marcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    

    desmarcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.appSettingsService.config.apiUrl}Mensagem/desmarcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }      

}
