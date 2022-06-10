import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AutenticacaoService } from './autenticacao.service';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private readonly autenticacaoService: AutenticacaoService, private router: Router) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent
    | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    // setTimeout(() => {
    //   this.autenticacaoService.renovarTokenSeNecessario();
    // }, 100);

    ;
    //header de versão
    let headers: { [name: string]: string | string[]; } = {
      'X-API-Version': environment.versaoApi
    };

    //adiciona o header de autenticação
    if (this.autenticacaoService.authEstaLogado()) {

      headers = {
        'Authorization': 'Bearer ' + this.autenticacaoService.obterToken(),
      };
    }
    else {
      if(!this.router.url.startsWith('/publico/')) {
        this.router.navigate(['account/login']);
      }
    }

    req = req.clone({ setHeaders: headers });

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // let resp:HttpResponse<any> = event;
          // debugger;
          // if(resp.body.indexOf("token") != -1){
          //   let token=JSON.parse(resp.body);
          //   let expira = new Date(Date.parse(token["expiration"]));
          //   if(expira < new Date()){

          //   }
          // }

        }
      }));
  }
}


