import { AutenticacaoService } from './../../../service/autenticacao/autenticacao.service';
import { OrcamentosService } from './../../../service/orcamento/orcamentos.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';

@Component({
  selector: 'app-orcamento',
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.scss']
})
export class PublicoOrcamentoComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentosService: OrcamentosService,
    private readonly alertaService: AlertaService
  ) { }

  guid: string;
  sub: Subscription;
  carregando: boolean = false;

  ngOnInit(): void {
    this.sub = this.activatedRoute.params.subscribe((param: any) => { this.fazerLogin(param); });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fazerLogin(param) {
    if(param.guid.length >= 32) {
      this.guid = param.guid;
      //TODO: BUSCAR ENVIRONMENT
      var usr = "PEDREIRA";
      var pwd = "XEROCRIX";
      
        this.autenticacaoService.authLogin2(usr, pwd).toPromise().then((r) => {
        if (r != null) {
          
          if (!this.autenticacaoService.readToken(r.AccessToken)) {
            //this.toast.showToast(eToast.error,"Ops! Tivemos um problema!")
            return;
          }
  
          if (this.autenticacaoService._lojasUsuarioLogado.length > 1) {
            this.autenticacaoService.setarToken(r.AccessToken);
            // this.autenticou = true;
            return;
          }
  
          this.autenticacaoService.setarToken(r.AccessToken);
          // sessionStorage.setItem("lojaLogada", this.loja);
          // sessionStorage.setItem("lojas", this.autenticacaoService._lojasUsuarioLogado.toString());
          // this.router.navigate(['orcamentos/listar/orcamentos']);

          //this.buscarOrcamentoPorGuid(this.guid);
        }
          //this.carregando = false;
        }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

  buscarOrcamentoPorGuid(param) {
    if(param.guid.length >= 32) {
      this.guid = param.guid;
        this.orcamentosService.buscarOrcamentoPorGuid(param.guid).toPromise().then((r) => {
        if (r != null) {
          console.log(r);
          //this.carregando = false;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
  }

}
