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
    setTimeout(() => {
      this.autenticacaoService.renovarTokenSeNecessario();
    }, 100);

    //header de versão
    let headers: { [name: string]: string | string[]; } = {
      'X-API-Version': environment.versaoApi
    };
    
    //adiciona o header de autenticação
    if (this.autenticacaoService.authEstaLogado()) {
      
      headers = {
        'Authorization': 'Bearer ' + this.autenticacaoService.obterToken(),
        'X-API-Version': environment.versaoApi
      };
    }
    else{
      this.router.navigate(['account/login']);
    }

    req = req.clone({ setHeaders: headers });

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          let resp: HttpResponse<any> = event;
          let respOk = false;
          if (resp.headers.get('X-API-Version') == environment.versaoApi) {
            respOk = true;
          }
          if (!respOk) {
            //forcamos o erro de versão
            (resp as any).status = 412;
            throw resp;
          }
        }
      }));
  }
}


