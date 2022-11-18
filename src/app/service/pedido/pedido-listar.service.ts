import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ParamsBuscaPedido } from './paramsBuscaPedido';
import { BehaviorSubject } from 'rxjs';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { PedidoDtoPedido } from 'src/app/dto/prepedido/pedido/pedidosDtoPedido';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoListarService {

  //a tela da busca edita diretamente as variáveis aqui dentro
  public paramsBuscaPedido: ParamsBuscaPedido = new ParamsBuscaPedido();


  constructor(
    private readonly http: HttpClient,
    private appSettingsService: AppSettingsService) {
    this.limpar(false);
  }

  limpar(limpar:boolean) {

    let data_inicial = "";
    let data_final = "";

    if(limpar){
      sessionStorage.removeItem('data_inicial_pedido');
      sessionStorage.removeItem('data_final_pedido');
    }else{
      data_inicial = sessionStorage.getItem('data_inicial_pedido');
      data_final = sessionStorage.getItem('data_final_pedido');
    }

    if (!data_inicial && !data_final) {
      this.paramsBuscaPedido = new ParamsBuscaPedido();
    this.paramsBuscaPedido.dataFinal = DataUtils.formataParaFormulario(new Date());
    this.paramsBuscaPedido.dataInicial = DataUtils.formataParaFormulario(DataUtils.somarDias(new Date(), -60));
    }
    else {
      this.paramsBuscaPedido.dataInicial = sessionStorage.getItem('data_inicial_pedido');
      this.paramsBuscaPedido.dataFinal = sessionStorage.getItem('data_final_pedido');
    }
  }

  salvarBuscaPedido(): void {
    sessionStorage.setItem('data_inicial_pedido', this.paramsBuscaPedido.dataInicial);
    sessionStorage.setItem('data_final_pedido', this.paramsBuscaPedido.dataFinal);
  }

  public carregando: boolean = false;
  pedidos$: BehaviorSubject<PedidoDtoPedido[]> = new BehaviorSubject(new Array());
  errosPedidos$: BehaviorSubject<any> = new BehaviorSubject(null);

  //afazer:criei essa variavel para fazer a conversão corretamente ao formatar a data
  public formato_hh_mm_ss: string = "00:00:00";
  //variaveis para mostrar as datas de buscas n atela mobile
  public data_mobile_inicial: string = "";
  public data_mobile_final: string = "";

  public atualizar(): void {
    let dtInicial: Date = DataUtils.formata_formulario_date(this.paramsBuscaPedido.dataInicial);
    let dtFinal: Date = DataUtils.formata_formulario_date(this.paramsBuscaPedido.dataFinal);

    let minDate = DataUtils.somarDias(new Date(), -60);

    if (dtInicial < minDate) {
      this.paramsBuscaPedido.dataInicial = DataUtils.formataParaFormulario(minDate);
    }

    this.salvarBuscaPedido();

    // Initialize Params Object
    let params = new HttpParams();

    //adiciona todos os parametros por nome
    //os nomes são todos iguais, devia ter um jeito de fazer isso automaticamente...
    params = params.append('clienteBusca', StringUtils.retorna_so_digitos(this.paramsBuscaPedido.clienteBusca));
    params = params.append('numPedido', this.paramsBuscaPedido.numeroPedido);
    params = params.append('dataInicial', DataUtils.formataParaFormulario(dtInicial));
    params = params.append('dataFinal', DataUtils.formataParaFormulario(dtFinal));
    /*
  //tipo de busca:
  tipoBusca:
          Todos = 0, PedidosEncerrados = 1, PedidosEmAndamento = 2
  */
    let tipoBusca: number = 0;
    if (this.paramsBuscaPedido.tipoBuscaEmAndamento && !this.paramsBuscaPedido.tipoBuscaEncerrado)
      tipoBusca = 2;
    if (!this.paramsBuscaPedido.tipoBuscaEmAndamento && this.paramsBuscaPedido.tipoBuscaEncerrado)
      tipoBusca = 1;
    params = params.append('tipoBusca', tipoBusca.toString());

    this.carregando = true;

    this.http.get<PedidoDtoPedido[]>(this.appSettingsService.config.apiUrl + 'pedido/listarPedidos', { params: params }).subscribe(
      {
        next: (r) => {
          this.carregando = false;
          this.pedidos$.next(r);
        },
        error: (err) => {
          this.carregando = false;
          this.errosPedidos$.next(err);
          this.errosPedidos$ = new BehaviorSubject(null);
        },
        complete: () => {
          this.carregando = false;
        }

      }
    );
  }


}
