import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AutenticacaoService } from './../service/autenticacao/autenticacao.service';
import { MensageriaService } from './../service/mensageria/mensageria.service';
import { DropDownItem } from '../views/orcamentos/models/DropDownItem';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { AlertaService } from '../components/alert-dialog/alerta.service';
import { ePermissao } from './../utilities/enums/ePermissao';
import { Title } from "@angular/platform-browser";
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';

@Component({
  selector: 'app-topbar',
  templateUrl: "app.topbar.component.html"
})
export class AppTopBarComponent {

  constructor(
    public app: AppComponent,
    public appMain: AppMainComponent,
    public readonly autenticacaoService: AutenticacaoService,
    private readonly mensageriaService: MensageriaService,
    private readonly router: Router,
    private fb: FormBuilder,
    private readonly lojaService: LojasService,
    private readonly alertaService: AlertaService,
    private titleService: Title,
    private appSettingsService: AppSettingsService
  ) { }
  public lojaLogada: any;
  parametro: string;
  qtdMensagem: any;
  public form: FormGroup;
  lojas: Array<DropDownItem> = [];
  filtro: Filtro = new Filtro();
  imagemLogotipo: string = this.autenticacaoService._lojaEstilo.imagemLogotipo;
  corCabecalho: string = this.autenticacaoService._lojaEstilo.corCabecalho;
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');

  meuDados: boolean = false;
  interval:any;

  ngOnInit(): void {
    this.criarForm();
    this.populaComboLojas();
    this.obterQuantidadeMensagemPendente();

    this.interval = setInterval(() => {
      this.obterQuantidadeMensagemPendente();
    }, Number(this.appSettingsService.config.temporizadorSininho));

    this.buscarEstilo();
  }

  carregando: boolean = false;
  obterQuantidadeMensagemPendente() {
    let sininho = sessionStorage.getItem("sininho");
    if(!sininho){
      this.limparInterval();
      return;
    }
    this.mensageriaService.obterQuantidadeMensagemPendente().toPromise().then((r) => {
      if (r != null) {
        this.qtdMensagem = r;
      }
    })
    .catch((e)=>{
      if(e.status == 401){
        this.limparInterval();
      }
      this.alertaService.mostrarErroInternet(e);
      
    })
  }

  limparInterval(){
    alert(this.interval);
    clearInterval(this.interval);
    this.autenticacaoService.authLogout();
  }

  buscarEstilo() {

    let usuario = this.autenticacaoService.getUsuarioDadosToken();
    if (usuario == null) {
      this.alertaService.mostrarMensagem("Falha ao carregar estilos!");
      return;
    }

    if (usuario.loja == null) {
      this.alertaService.mostrarMensagem("Ops! Parece que não conseguimos carregar a loja do usuário!");
      return;
    }

    this.lojaService.buscarLojaEstilo(usuario.loja).toPromise().then((r) => {
      if (!!r) {

        this.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;

        this.corCabecalho = r.corCabecalho + " !important";
        this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
        this.titleService.setTitle(r.titulo);
      }
    });

    if (usuario.permissoes.includes(ePermissao.ConsultarUsuarioLogado)) {
      this.meuDados = true;
    }
  }

  criarForm() {
    this.form = this.fb.group({
      cboLojas: [''],
    });
  }

  logoffClick() {
    this.autenticacaoService.authLogout();
    this.router.navigate(['/account/login'], { queryParams: {} });
  }

  populaComboLojas() {
    this.lojaLogada = sessionStorage.getItem("lojaLogada");
    var lojas = sessionStorage.getItem('lojas');

    if (lojas) {
      lojas.toString().split(',').forEach(x => {
        this.lojas.push({ Id: x, Value: `Loja: ${x}` });
      })
    };

    if (!lojas) {
      if (this.autenticacaoService._lojasUsuarioLogado) {
        this.autenticacaoService._lojasUsuarioLogado.forEach(x => {
          this.lojas.push({ Id: x, Value: `Loja: ${x}` });
        });
      }
    }

    if (this.lojas.length > 0) {
      if (this.lojaLogada) {
        this.form.controls.cboLojas.setValue(this.lojaLogada);
      }
    }

    if (this.lojas.length <= 1) {
      this.form.controls.cboLojas.disable();
    } else {
      this.form.controls.cboLojas.enable();
    }
  }

  cboLojas_onChange($event) {
    this.appMain.carregando = true;
    sessionStorage.setItem("lojaLogada", $event);
    this.autenticacaoService._lojaLogadoApoio = $event;
    this.autenticacaoService.buscarEstilo(this.autenticacaoService._lojaLogado);
    this.router.navigate(["dashboards"]);
  }
}
