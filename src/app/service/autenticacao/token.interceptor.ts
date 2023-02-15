import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpEvent, HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AutenticacaoService } from './autenticacao.service';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private readonly autenticacaoService: AutenticacaoService, 
    private readonly alertaService: AlertaService, 
    private router: Router, 
    private http: HttpClient, 
    private appSettingsService: AppSettingsService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent
    | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    let headers: { [name: string]: string | string[]; } = {
      'X-API-Version': this.appSettingsService.versao
    };

    if (this.autenticacaoService.authEstaLogado()) {
      headers = {
        'Authorization': 'Bearer ' + this.autenticacaoService.obterToken(),
        'X-API-Version': this.appSettingsService.versao
      };
    }
    else {
      if (!this.router.url.startsWith('/publico/')) {
        this.router.navigate(['account/login']);        
      }
    }
    
    if (sessionStorage.getItem("senhaExpirada") =="S"){
      this.router.navigate(['senha/senha-meusdados']);
    }

    console.log(localStorage.getItem("versaoApi"));
    console.log(this.appSettingsService.versao);

    if (localStorage.getItem("versaoApi") != this.appSettingsService.versao) {
      if (!this.router.url.startsWith('/publico/')) {
        this.alertaService.mostrarErroAtualizandoVersao();
      }else{
        localStorage.setItem('versaoApi', this.appSettingsService.versao);
        window.location.reload();
      }
    }

    req = req.clone({ setHeaders: headers });
    

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {

        if (event instanceof HttpResponse) {
          let resp: HttpResponse<any> = event;
          let respOk = false;

          if (localStorage.getItem("versaoApi") == this.appSettingsService.versao) {
            respOk = true;
          }        
          
          //Fizemos isso pq não é realizado a chamada na API
          let apiUrl = this.appSettingsService.config.apiUrl;
          if (event.url != apiUrl + "assets/demo/data/banco/menu.json") return;

          if (!respOk) {
            //forcamos o erro de versão
            (resp as any).status = 412;
            throw resp;
          }

        }

      }));
  }
}