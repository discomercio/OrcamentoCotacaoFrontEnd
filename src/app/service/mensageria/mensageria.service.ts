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
        return this.http.get<MensageriaDto[]>(environment.apiUrl + "Orcamento/mensagem?IdOrcamentoCotacao=" + idOrcamentoCotacao);
    }

    enviarMensagem(msg: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}Orcamento/mensagem`, msg);
    }

    marcarComoLida(idOrcamentoCotacao: string, idUsuarioDestinatario: string): Observable<any> {
        let params = new HttpParams();
        params = params.append("IdOrcamentoCotacao", idOrcamentoCotacao);
        params = params.append("idUsuarioDestinatario", idUsuarioDestinatario);        
        return this.http.put<any>(environment.apiUrl +"Orcamento/mensagem/lida", params);
    }

}
