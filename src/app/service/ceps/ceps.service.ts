import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from 'src/app/dto/ceps/estado';
import { environment } from 'src/environments/environment';
import { CepDto } from 'src/app/dto/ceps/CepDto';

@Injectable({
  providedIn: 'root'
})
export class CepsService {

  constructor(private http:HttpClient) { }

  buscarEstados():Observable<Estado[]>{
    return this.http.get<Estado[]>('assets/demo/data/banco/estados.json');
  }

  public buscarCep(cep: string, endereco: string, uf: string, cidade: string): Observable<CepDto[]> {
    //adiciona todos os parametros por nome
    let params = new HttpParams();
    params = params.append('cep', cep);
    params = params.append('endereco', endereco);
    params = params.append('uf', uf);
    params = params.append('cidade', cidade);

    return this.http.get<CepDto[]>(environment.apiUrl + 'api/cep/buscarCep/', { params: params });
  }

  public BuscarUfs(): Observable<string[]> {
    return this.http.get<string[]>(environment.apiUrl + 'api/cep/buscarUfs');
  }

  public BuscarLocalidades(uf: string): Observable<string[]> {
    let params = new HttpParams();
    params = params.append('uf', uf);
    return this.http.get<string[]>(environment.apiUrl + 'api/cep/buscarLocalidades', { params: params });
  }

  public buscarCepPorEndereco(endereco: string, localidade: string, uf: string): Observable<CepDto[]> {
    let params = new HttpParams();
    params = params.append('endereco', endereco);
    params = params.append('localidade', localidade);
    params = params.append('uf', uf);
    return this.http.get<CepDto[]>(environment.apiUrl + 'api/cep/buscarCepPorEndereco', { params: params });
  }
}
