import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObterEstruturaResponse } from './../../dto/arquivo/ObterEstruturaResponse';
import { DownloadResponse } from './../../dto/arquivo/DownloadResponse';
import { ArquivoExcluirResponse } from './../../dto/arquivo/ArquivoExcluirResponse';
import { ArquivoEditarResponse } from './../../dto/arquivo/ArquivoEditarResponse';
import { ArquivoNovaPastaResponse } from './../../dto/arquivo/ArquivoNovaPastaResponse';
import { ArquivoUploadResponse } from './../../dto/arquivo/ArquivoUploadResponse';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  constructor(private readonly http: HttpClient, private appSettingsService: AppSettingsService) { }

  public urlUpload: string = `${this.appSettingsService.config.apiUrl}arquivo/upload`;

  public buscarToTree(): Observable<ObterEstruturaResponse> {
    return this.http.get<ObterEstruturaResponse>(`${this.appSettingsService.config.apiUrl}arquivo/ObterEstrutura`);
  }

  public download(id: any): Observable<DownloadResponse> {
    return this.http.get<DownloadResponse>(`${this.appSettingsService.config.apiUrl}arquivo/download/${id}`);
  }

  public excluir(id: any, loja: string): Observable<ArquivoExcluirResponse> {
    return this.http.post<ArquivoExcluirResponse>(`${this.appSettingsService.config.apiUrl}arquivo/excluir/`, { id: id, loja: loja });
  }

  public editar(id: string, nome: string, descricao: string, loja:string): Observable<ArquivoEditarResponse> {
    // return this.http.put<ArquivoEditarResponse>(`${this.appSettingsService.config.apiUrl}arquivo/editar?id=${id}&nome=${nome}&descricao=${descricao}`, id);
    return this.http.put<ArquivoEditarResponse>(`${this.appSettingsService.config.apiUrl}arquivo/editar`, {id: id, nome: nome, descricao:descricao, loja:loja});
  }

  public novaPasta(idpai: string, nome: string, descricao: string, loja: string): Observable<ArquivoNovaPastaResponse> {
    return this.http.post<ArquivoNovaPastaResponse>(`${this.appSettingsService.config.apiUrl}arquivo/criarpasta/`, { idPai: idpai, nome: nome, descricao: descricao, loja: loja });
  }

  public upload(idpai: string, arquivo: any, loja:string): Observable<ArquivoUploadResponse> {

    const formData = new FormData();
    formData.append("arquivo", arquivo.files[0], arquivo.files[0].name);
    formData.append("idPai", idpai);
    formData.append("loja", loja);
    return this.http.post<ArquivoUploadResponse>(`${this.appSettingsService.config.apiUrl}arquivo/upload`, 
      formData, { reportProgress: true });
  }
}

