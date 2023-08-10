import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AutenticacaoService } from './../service/autenticacao/autenticacao.service';
import { DropDownItem } from '../views/orcamentos/models/DropDownItem';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { AlertaService } from '../components/alert-dialog/alerta.service';
import { ePermissao } from './../utilities/enums/ePermissao';
import { Title } from "@angular/platform-browser";
import { ListaQuantidadeMensagemPendenteResponse } from '../dto/mensageria/lista-quantidade-mensagem-pendente-response';
import { AppTopBarService } from './app.topBar.service';

@Component({
  selector: 'app-topbar',
  templateUrl: "app.topbar.component.html"
})
export class AppTopBarComponent implements OnInit {

  constructor(
    public app: AppComponent,
    public appMain: AppMainComponent,
    public readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private fb: FormBuilder,
    private readonly lojaService: LojasService,
    private readonly alertaService: AlertaService,
    private titleService: Title,
    public readonly appTopBarService: AppTopBarService
  ) { }
  public lojaLogada: any;
  public nomeUsuario: string;

  parametro: string;
  public form: FormGroup;
  lojas: Array<DropDownItem> = [];
  filtro: Filtro = new Filtro();
  imagemLogotipo: string = this.autenticacaoService._lojaEstilo.imagemLogotipo;
  corCabecalho: string = this.autenticacaoService._lojaEstilo.corCabecalho;
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  listaMensagemPendente: ListaQuantidadeMensagemPendenteResponse = new ListaQuantidadeMensagemPendenteResponse();

  qtdeLojasUsuarioLogado: number = 0;
  meuDados: boolean = false;
  interval: any;

  ngOnInit(): void {
    this.criarForm();
    this.populaComboLojas();
    this.buscarEstilo();
    this.qtdeLojasUsuarioLogado = this.autenticacaoService._lojasUsuarioLogado.length;
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
    this.nomeUsuario = usuario.nome;
    this.lojaService.buscarLojaEstilo(usuario.loja).toPromise().then((r) => {
      if (!!r) {

        this.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;

        this.corCabecalho = r.corCabecalho + " !important";
        this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
        this.titleService.setTitle(r.titulo);
      }
    });

    if (usuario.permissoes.includes(ePermissao.ConsultarUsuarioLogado)) {

      const fetch = require("sync-fetch");

      const appsettings = fetch("/assets/config/appsettings.json", {
      }).json();

      if (Boolean(appsettings.ambienteProducao)) {
        this.meuDados = false;
      } else {
        this.meuDados = true;
      }
    }
  }

  criarForm() {
    this.form = this.fb.group({
      cboLojas: [''],
    });
  }

  logoffClick() {
    this.appTopBarService.qtdMensagem = 0;
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
