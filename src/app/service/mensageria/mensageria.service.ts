import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MensageriaService {

  constructor(private http: HttpClient, private env: environment) { }

    obterListaMensagem(idOrcamentoCotacao: string): Observable<MensageriaDto[]> {
    
    let params = new HttpParams();    
        params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
        return this.http.get<MensageriaDto[]>(this.env.apiUrl() + "Mensagem/?IdOrcamentoCotacao=" + idOrcamentoCotacao);
    }

    obterListaMensagemPendente(idOrcamentoCotacao: string): Observable<MensageriaDto[]> {
    
      let params = new HttpParams();    
          params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
          return this.http.get<MensageriaDto[]>(this.env.apiUrl() + "Mensagem/pendente?IdOrcamentoCotacao=" + idOrcamentoCotacao);
      }    

    obterQuantidadeMensagemPendente() {
      return this.http.get<number[]>(this.env.apiUrl() + "Mensagem/pendente/quantidade");
    }          

    enviarMensagem(msg: any): Observable<any> {
        return this.http.post<any>(`${this.env.apiUrl()}Mensagem/`, msg);
    }

    marcarMensagemComoLida(idOrcamentoCotacao: string): Observable<any> {      
      return this.http.put<any>(`${this.env.apiUrl()}Mensagem/marcar/lida?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }        
    
    marcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.env.apiUrl()}Mensagem/marcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    

    desmarcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${this.env.apiUrl()}Mensagem/desmarcar/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }      

}
