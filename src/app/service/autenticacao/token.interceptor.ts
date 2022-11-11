import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpEvent, HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AutenticacaoService } from './autenticacao.service';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  env: environment;

  constructor(private readonly autenticacaoService: AutenticacaoService, private readonly alertaService: AlertaService, private router: Router, private http: HttpClient, private envir: environment) {
    this.env = envir
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent
    | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    let headers: { [name: string]: string | string[]; } = {
      'X-API-Version': this.env.versaoApi()
    };

    if (this.autenticacaoService.authEstaLogado()) {
      headers = {
        'Authorization': 'Bearer ' + this.autenticacaoService.obterToken(),
        'X-API-Version': this.env.versaoApi()
      };
    }
    else {
      if (!this.router.url.startsWith('/publico/')) {
        this.router.navigate(['account/login']);        
      }
    }
    
    if (localStorage.getItem("versaoApi") != this.env.versaoApi()) {
      if (!this.router.url.startsWith('/publico/')) {
        this.alertaService.mostrarErroAtualizandoVersao();
      }else{
        localStorage.setItem('versaoApi', this.env.versaoApi());
        window.location.reload();
      }
    }

    req = req.clone({ setHeaders: headers });
    

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {

        if (event instanceof HttpResponse) {
          let resp: HttpResponse<any> = event;
          let respOk = false;

          if (localStorage.getItem("versaoApi") == this.env.versaoApi()) {
            respOk = true;
          }        
          
          //Fizemos isso pq não é realizado a chamada na API
          let apiUrl = this.env.apiUrl();
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