import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TelaDesktopService {
  telaAtual$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private telaDesktop: boolean = true;
  private jaLido: boolean = false;
  private telaDesktopAnterior: boolean = true;
  public carregando: boolean = false;
  constructor(private breakpointObserver: BreakpointObserver,
    private readonly router: Router) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        this.telaDesktop = !state.matches;
        this.telaAtual$.next(this.telaDesktop);
      });
  }
}
