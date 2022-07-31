import { HostListener, Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CommonModule } from "@angular/common";
import { PrePedidoDto } from 'src/app/dto/prepedido/DetalhesPrepedido/PrePedidoDto';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { FormaPagtoDto } from 'src/app/dto/forma-pagto/FormaPagtoDto';


@Injectable({
  providedIn: 'root'
})
export class PrepedidoService {

  public carregando: boolean = false;
  private pedidos$: Observable<any> = new Observable();

  constructor(private readonly http: HttpClient) { }    
    
  public carregar(numeroPrePedido: string): Observable<any> {

    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    params = params.append('numPrepedido', numeroPrePedido);
    this.carregando = true;

    this.pedidos$ = Observable.create(observer => {
      this.http.get<any>(environment.apiUrl + 'api/prepedido/buscarPrePedido', { params: params }).toPromise()
        .then(response => {          
          if (response)
            this.carregando = false;
          observer.next(response);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        });
    });
    return this.pedidos$;
  }

  // public removerPrePedido(idPedido: string):Observable<any>{
  //   //TODO: Investigar porque Interceptor não foi chamado para incluir o Header automaticamente
  //   let headers: { [name: string]: string | string[]; } = { 'X-API-Version': environment.versaoApi };
  //   return this.http.post(`${environment.apiUrl}api/prepedido/removerPrePedido/${idPedido}`, idPedido, { headers: headers});
  // }  

  public Obter_Permite_RA_Status(): Observable<number> {
    return this.http.get<any>(environment.apiUrl + 'api/prepedido/obter_permite_ra_status');
  }

  public cadastrarPrepedido(prePedidoDto: PrePedidoDto): Observable<string[]> {
    
    return this.http.post<string[]>(environment.apiUrl + 'api/prepedido/cadastrarPrepedido', prePedidoDto);
  }

 
  public buscarCoeficienteFornecedores(fornecedores: string[]): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + 'api/prepedido/buscarCoeficienteFornecedores', fornecedores);
  }

  public buscarQtdeParcCartaoVisa(): Observable<number> {
    return this.http.get<number>(environment.apiUrl + 'api/prepedido/buscarQtdeParcCartaoVisa');
  }

  public ObtemPercentualVlPedidoRA():Observable<number> {
    return this.http.get<number>(environment.apiUrl + 'api/prepedido/obtemPercentualVlPedidoRA');
  }

  public listarCpfCnpjPrepedidosCombo(): Observable<string[]> {
    return this.http.get<string[]>(environment.apiUrl + 'api/prepedido/listarCpfCnpjPrepedidosCombo');
  }

  public listarNumerosPrepedidosCombo(): Observable<string[]> {
    return this.http.get<string[]>(environment.apiUrl + 'api/prepedido/listarNumerosPrepedidosCombo');
  }

  public remover(numeroPrepedido): Observable<any> {
    return this.http.post(environment.apiUrl + 'api/prepedido/removerPrePedido/' + numeroPrepedido, numeroPrepedido);
  }

  public buscarFormaPagto(tipos_pessoa: string): Observable<FormaPagtoDto> {
    let params = new HttpParams();
    params = params.append('tipo_pessoa', tipos_pessoa);
    return this.http.get<FormaPagtoDto>(environment.apiUrl + 'api/prepedido/buscarFormasPagto', { params: params });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }

}
