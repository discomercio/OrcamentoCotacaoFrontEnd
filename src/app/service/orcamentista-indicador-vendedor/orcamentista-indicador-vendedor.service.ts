import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { map } from 'rxjs/operators';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { OrcamentistaIndicadorVendedorDeleteRequest } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor-delete-request';
import { OrcamentistaIndicadorVendedorDeleteResponse } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor-delete-response';
import { UsuariosRequest } from 'src/app/dto/usuarios/usuarios-request';
import { ListaOrcamentistaVendedorResponse } from 'src/app/dto/orcamentista-indicador-vendedor/lista-orcamentista-vendedor-response';

@Injectable({
  providedIn: 'root'
})
export class OrcamentistaIndicadorVendedorService {


  constructor(
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  buscarVendedoresParceiros(parceiro:string): Observable<OrcamentistaIndicadorVendedorDto[]> {
    let params = new HttpParams();
    params = params.append('parceiro', parceiro);
    return this.http.get<OrcamentistaIndicadorVendedorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', { params: params })
    .pipe(map(res=>OrcamentistaIndicadorVendedorDto.arrayJSONtoConcret(res)));
  }

  buscarVendedoresParceirosPorParceiros(parceiros :string[]): Observable<OrcamentistaIndicadorVendedorDto[]> {
    return this.http.post<OrcamentistaIndicadorVendedorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros-por-parceiros', parceiros);
  }

  buscarVendedoresParceirosPorParceiroELoja(usuario:string, loja: string): Observable<OrcamentistaIndicadorVendedorDto[]> {
    let params = new HttpParams();
    params = params.append('apelido', usuario);
    params = params.append('loja', loja);
    return this.http.get<OrcamentistaIndicadorVendedorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros-apelido-loja', { params: params })
    .pipe(map(res=>OrcamentistaIndicadorVendedorDto.arrayJSONtoConcret(res)));
  }  

  buscarVendedoresParceirosPorVendedorELoja(usuario:string, loja: string): Observable<OrcamentistaIndicadorVendedorDto[]> {
    let params = new HttpParams();
    params = params.append('vendedor', usuario);
    params = params.append('loja', loja);
    return this.http.get<OrcamentistaIndicadorVendedorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros-vendedor-loja', { params: params })
    .pipe(map(res=>OrcamentistaIndicadorVendedorDto.arrayJSONtoConcret(res)));
  }    

  buscarVendedoresParceirosPorloja(loja: string): Observable<OrcamentistaIndicadorVendedorDto[]> {
    let params = new HttpParams();
    params = params.append('loja', loja);

    return this.http.get<OrcamentistaIndicadorVendedorDto[]>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros-loja', { params: params })
    .pipe(map(res=>OrcamentistaIndicadorVendedorDto.arrayJSONtoConcret(res)));
  }  
  buscarVendedoresParceirosPorId(id:string): Observable<Usuario> {
    return this.http.get<Usuario>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros/'+id);
  }
  cadastrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  } 
  atualizar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/vendedores-parceiros', usuario);
  }

  excluir(request:OrcamentistaIndicadorVendedorDeleteRequest):Observable<OrcamentistaIndicadorVendedorDeleteResponse>{
    return this.http.post<OrcamentistaIndicadorVendedorDeleteResponse>(this.appSettingsService.config.apiUrl + 'OrcamentistaEIndicadorVendedor/delete', request);
  }

  buscarVendedoresParceiro(request:UsuariosRequest):Observable<ListaOrcamentistaVendedorResponse>{
    return this.http.post<ListaOrcamentistaVendedorResponse>(`${this.appSettingsService.config.apiUrl}OrcamentistaEIndicadorVendedor/listar-orcamentista-vendedor`, request);
  }
}
