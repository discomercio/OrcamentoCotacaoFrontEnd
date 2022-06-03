import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MensageriaService {

  constructor(private http: HttpClient) { }

    obterListaMensagem(idOrcamentoCotacao: string): Observable<MensageriaDto[]> {
    
    let params = new HttpParams();    
        params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
        return this.http.get<MensageriaDto[]>(environment.apiUrl + "Mensagem/?IdOrcamentoCotacao=" + idOrcamentoCotacao);
    }

    enviarMensagem(msg: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}Mensagem/`, msg);
    }

    marcarMensagemComoLida(idOrcamentoCotacao: string): Observable<any> {      
      return this.http.put<any>(`${environment.apiUrl}Mensagem/lida?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }        
    
    marcarPendenciaTratada(idOrcamentoCotacao: string): Observable<any> {
      return this.http.put<any>(`${environment.apiUrl}Mensagem/pendencia?idOrcamentoCotacao=${idOrcamentoCotacao}`, idOrcamentoCotacao);
    }    

}
