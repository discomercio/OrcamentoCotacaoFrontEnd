import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AutenticacaoService } from './autenticacao.service';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private readonly autenticacaoService: AutenticacaoService, private router: Router) {  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent
    | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    ;

    var headers = new HttpHeaders();

    if (this.autenticacaoService.authEstaLogado()) {
      headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.autenticacaoService.obterToken(),
        'X-API-Version': environment.versaoApi
      });
    }
    else {
      if(!this.router.url.startsWith('/publico/')) {
        this.router.navigate(['account/login']);
      }
    }

    req = req.clone({headers});

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
      }));
  }
}


