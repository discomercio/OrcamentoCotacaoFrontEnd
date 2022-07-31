import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(
        private autenticacaoService: AutenticacaoService,
        private router: Router
        ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): 
        boolean | Observable<boolean> | Promise<boolean> {

        if (!this.autenticacaoService.authEstaLogado()) {
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

} 