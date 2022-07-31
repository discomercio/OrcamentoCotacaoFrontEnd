import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ImpressaoService {

  constructor(private readonly router: Router, ) { }

  emImpressao(): boolean {
    //forçando?
    if (this.forcarImpressao)
      return true;

    //estas sempre são para impressão
    if (this.router.url.indexOf('/pedido/imprimir') >= 0 || this.router.url.indexOf('/prepedido/imprimir') >= 0)
      return true;

    //se estiver imprimindo, suprime o menu
    if (window.matchMedia("print").matches)
      return true;

    //nao está imprimindo
    return false;
  }

  //temos uma opcao para forçar a impessão
  public forcarImpressao: boolean = false;

  //coisas específicas para imprimir o pedido
  private imprimirOcorrenciasChave = "pedido-imprimirOcorrencias";
  private imprimirBlocoNotasChave = "pedido-imprimirBlocoNotas";
  private imprimirNotasDevChave = "pedido-imprimirNotasDev";
  imprimirOcorrencias(): boolean {
    return sessionStorage.getItem(this.imprimirOcorrenciasChave) == "1";
  }
  imprimirOcorrenciasSet(valor: boolean): void {
    sessionStorage.setItem(this.imprimirOcorrenciasChave, valor ? "1" : "0");
  }
  imprimirBlocoNotas(): boolean {
    return sessionStorage.getItem(this.imprimirBlocoNotasChave) == "1";
  }
  imprimirBlocoNotasSet(valor: boolean): void {
    sessionStorage.setItem(this.imprimirBlocoNotasChave, valor ? "1" : "0");
  }
  imprimirNotasDev(): boolean {
    return sessionStorage.getItem(this.imprimirNotasDevChave) == "1";
  }
  imprimirNotasDevSet(valor: boolean): void {
    sessionStorage.setItem(this.imprimirNotasDevChave, valor ? "1" : "0");
  }

}
