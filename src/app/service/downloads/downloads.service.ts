import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ObterEstruturaResponse } from './../../dto/arquivo/ObterEstruturaResponse';
import { DownloadResponse } from './../../dto/arquivo/DownloadResponse';
import { ArquivoExcluirResponse } from './../../dto/arquivo/ArquivoExcluirResponse';
import { ArquivoEditarResponse  } from './../../dto/arquivo/ArquivoEditarResponse';
import { ArquivoNovaPastaResponse  } from './../../dto/arquivo/ArquivoNovaPastaResponse';
import { ArquivoUploadResponse  } from './../../dto/arquivo/ArquivoUploadResponse';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient, private env: environment, private appSettingsService: AppSettingsService) { }

  public urlUpload: string = `${this.appSettingsService.config.apiUrl}arquivo/upload`;

  public buscarToTree(): Observable<ObterEstruturaResponse> {
    return this.http.get<ObterEstruturaResponse>(`${this.appSettingsService.config.apiUrl}arquivo/ObterEstrutura`);
  }
  
  public download(id: any) : Observable<DownloadResponse> {
    return this.http.get<DownloadResponse>(`${this.appSettingsService.config.apiUrl}arquivo/download/${id}`);
  }
  
  public excluir(id: any):Observable<ArquivoExcluirResponse>{
     return this.http.post<ArquivoExcluirResponse>(`${this.appSettingsService.config.apiUrl}arquivo/excluir/${id}`, { id: id });
   }
  
  public editar(id:string, nome:string, descricao:string):Observable<ArquivoEditarResponse>{
    return this.http.put<ArquivoEditarResponse >(`${this.appSettingsService.config.apiUrl}arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id);
  }
  
  public novaPasta(idpai:string, nome:string, descricao:string):Observable<ArquivoNovaPastaResponse> {
    return this.http.post<ArquivoNovaPastaResponse>(`${this.appSettingsService.config.apiUrl}arquivo/criarpasta/`, { idPai: idpai, nome: nome, descricao: descricao });
  }

  public upload(idpai:string, arquivo: any): Observable<ArquivoUploadResponse> {

    const formData = new FormData();
    formData.append(arquivo.files[0].name, arquivo.files[0]);

    return this.http.post<ArquivoUploadResponse>(`${this.appSettingsService.config.apiUrl}arquivo/upload/${idpai}`,  
    formData, { reportProgress: true });
  }
}

