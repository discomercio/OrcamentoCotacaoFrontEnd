import { Injectable } from '@angular/core';
import { ParamsBuscaPrepedido } from './paramsBuscaPrepedido';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { PrepedidosCadastradosDtoPrepedido } from 'src/app/dto/prepedido/prepedido/prepedidosCadastradosDtoPrepedido';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable({
  providedIn: 'root'
})
export class PrepedidoListarService {

  //a tela da busca edita diretamente as variáveis aqui dentro
  public paramsBuscaPrepedido: ParamsBuscaPrepedido = new ParamsBuscaPrepedido();
  // public paramsBuscaPrepedido: ParamsBuscaPrepedido;

  constructor(
    private readonly http: HttpClient, 
    private appSettingsService: AppSettingsService) {
    this.limpar(false);
  }

  limpar(limpar:boolean) {
    let data_inicial = "";
    let data_final = "";

    if(limpar){
      sessionStorage.removeItem('data_inicial_prepedido');
      sessionStorage.removeItem('data_final_prepedido');
    }else{
      data_inicial = sessionStorage.getItem('data_inicial_prepedido');
      data_final = sessionStorage.getItem('data_final_prepedido');
    }

    if (!data_inicial && !data_final) {
      this.paramsBuscaPrepedido = new ParamsBuscaPrepedido();
      this.paramsBuscaPrepedido.dataFinal = DataUtils.formataParaFormulario(new Date());
      this.paramsBuscaPrepedido.dataInicial = DataUtils.formataParaFormulario(DataUtils.somarDias(new Date(), -60));
    }
    else {
      this.paramsBuscaPrepedido.dataInicial = sessionStorage.getItem('data_inicial_prepedido');
      this.paramsBuscaPrepedido.dataFinal = sessionStorage.getItem('data_final_prepedido');
    }
  }

  salvarBuscaPrepedido(): void {
    sessionStorage.setItem('data_inicial_prepedido', this.paramsBuscaPrepedido.dataInicial);
    sessionStorage.setItem('data_final_prepedido', this.paramsBuscaPrepedido.dataFinal);
  }


  public carregando: boolean = false;
  prepedidos$: BehaviorSubject<PrepedidosCadastradosDtoPrepedido[]> = new BehaviorSubject(new Array());
  errosPrepedidos$: BehaviorSubject<any> = new BehaviorSubject(null);

  //variaveis para mostrar as datas de buscas na tela mobile
  public data_mobile_inicial: string;
  public data_mobile_final: string;


  public atualizar(): void {

    let dtInicial: Date = DataUtils.formata_formulario_date(this.paramsBuscaPrepedido.dataInicial);
    let dtFinal: Date = DataUtils.formata_formulario_date(this.paramsBuscaPrepedido.dataFinal);

    let minDate = DataUtils.somarDias(new Date(), -60);

    if (dtInicial < minDate) {
      this.paramsBuscaPrepedido.dataInicial = DataUtils.formataParaFormulario(minDate);
    }

    this.salvarBuscaPrepedido();

    // Initialize Params Object
    let params = new HttpParams();
    //adiciona todos os parametros por nome
    //os nomes são todos iguais, devia ter um jeito de fazer isso automaticamente...
    params = params.append('clienteBusca', StringUtils.retorna_so_digitos(this.paramsBuscaPrepedido.clienteBusca));
    params = params.append('numeroPrePedido', this.paramsBuscaPrepedido.numeroPrePedido);
    params = params.append('dataInicial', DataUtils.formataParaFormulario(dtInicial));
    params = params.append('dataFinal', DataUtils.formataParaFormulario(dtFinal));
    /*
    //tipo de busca:
    tipoBusca:
            Todos = 0, NaoViraramPedido = 1, SomenteViraramPedido = 2, Excluidos = 3
    */

    // this.paramsBuscaPrepedido.dataInicial = DataUtils.formatarTela(dtInicial);
    // this.paramsBuscaPrepedido.dataFinal = DataUtils.formatarTela(dtFinal);


    let tipoBusca: number = 0;
    if (this.paramsBuscaPrepedido.tipoBuscaAndamento &&
      !this.paramsBuscaPrepedido.tipoBuscaPedido &&
      !this.paramsBuscaPrepedido.tipoBuscaPedidoExcluidos)
      tipoBusca = 1;
    if (!this.paramsBuscaPrepedido.tipoBuscaAndamento &&
      this.paramsBuscaPrepedido.tipoBuscaPedido &&
      !this.paramsBuscaPrepedido.tipoBuscaPedidoExcluidos)
      tipoBusca = 2;
    if (!this.paramsBuscaPrepedido.tipoBuscaAndamento &&
      !this.paramsBuscaPrepedido.tipoBuscaPedido &&
      this.paramsBuscaPrepedido.tipoBuscaPedidoExcluidos)
      tipoBusca = 3;

    params = params.append('tipoBusca', tipoBusca.toString());

    this.carregando = true;
    this.http.get<PrepedidosCadastradosDtoPrepedido[]>(this.appSettingsService.config.apiUrl + 'prepedido/listarPrePedidos', { params: params }).subscribe(
      {
        next: (r) => {
          this.carregando = false;
          this.prepedidos$.next(r);
        },
        error: (err) => {
          this.carregando = false;
          this.errosPrepedidos$.next(err);
          this.errosPrepedidos$ = new BehaviorSubject(null);
        },
        complete: () => {
          this.carregando = false;
        }
      }
    );
  }



}
