/*import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

import { AutenticacaoService } from './autenticacao.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate, CanActivateChild {
    constructor(
        private autenticacaoService: AutenticacaoService,
        private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

        let estalogado = this.autenticacaoService.authEstaLogado();
        if (!estalogado) {
            this.router.navigate(['account/login'])
            return false;
        }
        return true;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): 
        boolean | import("@angular/router").UrlTree | Observable<boolean | import("@angular/router").UrlTree> 
        | Promise<boolean | import("@angular/router").UrlTree> {
        return this.canActivate(childRoute, state);
    }

}*/