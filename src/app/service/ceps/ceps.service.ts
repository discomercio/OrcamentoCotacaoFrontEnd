import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from 'src/app/dto/ceps/estado';
import { CepDto } from 'src/app/dto/ceps/CepDto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class CepsService {

  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) {
  }

  buscarEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>('assets/demo/data/banco/estados.json');
  }

  public buscarCep(cep: string, endereco: string, uf: string, cidade: string, origem: string = null): Observable<CepDto[]> {
    //adiciona todos os parametros por nome
    let params = new HttpParams();
    params = params.append('cep', cep);
    params = params.append('endereco', endereco);
    params = params.append('uf', uf);
    params = params.append('cidade', cidade);

    if (origem == "publico")
      return this.http.get<CepDto[]>(`${this.appSettingsService.config.apiUrl}publico/buscarCep/`, { params: params });

    return this.http.get<CepDto[]>(this.appSettingsService.config.apiUrl + 'api/cep/buscarCep/', { params: params });
  }

  public BuscarUfs(origem: string = null): Observable<string[]> {
    if (origem == "publico")
      return this.http.get<string[]>(this.appSettingsService.config.apiUrl + 'publico/buscarUfs');

    return this.http.get<string[]>(this.appSettingsService.config.apiUrl + 'api/cep/buscarUfs');
  }

  public BuscarLocalidades(uf: string, origem: string = null): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('uf', uf);
    if (origem == "publico")
      return this.http.get<string[]>(this.appSettingsService.config.apiUrl + 'publico/buscarLocalidades', { params: params });

    return this.http.get<string[]>(this.appSettingsService.config.apiUrl + 'api/cep/buscarLocalidades', { params: params });
  }

  public buscarCepPorEndereco(endereco: string, localidade: string, uf: string, origem: string = null): Observable<CepDto[]> {
    let params = new HttpParams();
    params = params.append('endereco', endereco);
    params = params.append('localidade', localidade);
    params = params.append('uf', uf);

    if (origem == "publico")
      return this.http.get<CepDto[]>(this.appSettingsService.config.apiUrl + 'publico/buscarCepPorEndereco', { params: params });

    return this.http.get<CepDto[]>(this.appSettingsService.config.apiUrl + 'api/cep/buscarCepPorEndereco', { params: params });
  }
}
