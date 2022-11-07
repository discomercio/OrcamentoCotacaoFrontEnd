import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { PedidoDto } from 'src/app/dto/pedido/detalhesPedido/PedidoDto2';
import { PrePedidoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrePedidoDto';
import { FormaPagtoDto } from 'src/app/dto/prepedido/FormaPagto/FormaPagtoDto';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { PrepedidoProdutoDtoPrepedido } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrepedidoProdutoDtoPrepedido';
import { CoeficienteDto } from 'src/app/dto/prepedido/Produto/CoeficienteDto';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoBuscarService {

  public carregando: boolean = false;
  private pedidos$: Observable<PrePedidoDto> = new Observable();
  public formaPagto$: Observable<FormaPagtoDto> = new Observable();
  public dadosClienteDto: DadosClienteCadastroDto = new DadosClienteCadastroDto();

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) { }

  public buscar(numeroPrePedido: string): Observable<PrePedidoDto> {

    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    params = params.append('numPrepedido', numeroPrePedido);
    this.carregando = true;

    this.pedidos$ = Observable.create(observer => {
      this.http.get<any>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarPrePedido', { params: params }).toPromise()
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

  
  

  public Obter_Permite_RA_Status(): Observable<number> {
    return this.http.get<any>(this.appSettingsService.config.apiUrl + 'api/prepedido/obter_permite_ra_status');
  }

  public cadastrarPrepedido(prePedidoDto: PrePedidoDto): Observable<string[]> {
    
    return this.http.post<string[]>(this.appSettingsService.config.apiUrl + 'api/prepedido/cadastrarPrepedido', prePedidoDto);
  }

  public buscarFormaPagto(tipos_pessoa: string): Observable<FormaPagtoDto> {
    let params = new HttpParams();
    params = params.append('tipo_pessoa', tipos_pessoa);
    return this.http.get<FormaPagtoDto>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarFormasPagto', { params: params });
  }

  // buscar lista de coeficientes para calcular os valores referentes a forma de pagamento
  public buscarCoeficiente(prepedidoProdutoDtoPrepedido: PrepedidoProdutoDtoPrepedido[]): Observable<CoeficienteDto[]> {
    return this.http.post<CoeficienteDto[]>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarCoeficiente', prepedidoProdutoDtoPrepedido);
  }

  public buscarCoeficienteFornecedores(fornecedores: string[]): Observable<any[]> {
    return this.http.post<any[]>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarCoeficienteFornecedores', fornecedores);
  }

  public buscarQtdeParcCartaoVisa(): Observable<number> {
    return this.http.get<number>(this.appSettingsService.config.apiUrl + 'api/prepedido/buscarQtdeParcCartaoVisa');
  }

  public ObtemPercentualVlPedidoRA():Observable<number> {
    return this.http.get<number>(this.appSettingsService.config.apiUrl + 'api/prepedido/obtemPercentualVlPedidoRA');
  }
}
