
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, VERSION, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoOpcaoService } from 'src/app/service/orcamento-opcao/orcamento-opcao.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { MensageriaService } from 'src/app/service/mensageria/mensageria.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';


@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoOpcaoService: OrcamentoOpcaoService,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly mensagemService: MensagemService,
    private readonly orcamentoCotacaoMensagemService: MensageriaService,
    private fb: FormBuilder,
    private location: Location,
    private readonly formaPagtoService: FormaPagtoService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService) {
    super(telaDesktopService);
  }
  public form: FormGroup;
  listaMensagens: MensageriaDto[];
  dataUtils: DataUtils = new DataUtils();

  vendedor: boolean;
  tipoUsuario: string;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  public mascaraTelefone: string;
  formataTelefone = new FormataTelefone();

  @ViewChild("mensagem") mensagem: ElementRef;

  idOrcamentoCotacao: number;
  ngOnInit(): void {
    this.formataTelefone = FormataTelefone.mascaraTelefoneTexto;
    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
    
    // FIXO - Pois no momento que foi constrúido a mensageria, as informações carregadas na tela eram mocking. 
    this.vendedor = true;
    // this.idOrcamentoCotacao = "2";

    if (this.vendedor) {
      this.idUsuarioRemetente = "50197";
      this.idUsuarioDestinatario = "50025";
    } else {
      this.idUsuarioRemetente = "50025";
      this.idUsuarioDestinatario = "50197";
    }

    this.orcamentoCotacaoMensagemService.marcarComoLida(this.idOrcamentoCotacao.toString(), this.idUsuarioRemetente);

    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
      console.log(this.desabiltarBotoes);
    });
    this.buscarOrcamento(this.idOrcamentoCotacao);
    this.obterListaMensagem(2);
    this.buscarFormasPagto();

    
    
  }

  @Input() desabiltarBotoes: boolean;

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;

  buscarOrcamento(id: number) {
    this.novoOrcamentoService.criarNovo();
    this.orcamentoService.buscarOrcamento(id).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto = r;
        console.log(this.novoOrcamentoService.orcamentoCotacaoDto);
        if(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro){
          this.buscarParceiro(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
        }
      }
    });
  }

razaoSocialParceiro:string;
  buscarParceiro(apelido){
 this.orcamentistaIndicadorService.buscarParceiroPorApelido(apelido).toPromise().then((r) =>{
   if(r != null){
     this.razaoSocialParceiro = r.razaoSocial;
   }
 })
  }

  formaPagamento: FormaPagto[] = new Array();
  buscarFormasPagto() {
    let orcamento = this.novoOrcamentoService.orcamentoCotacaoDto;
    let comIndicacao: number = 0;
    if (orcamento.parceiro != null)
      comIndicacao = 1;

    let formaPagtoOrcamento = new Array<FormaPagtoCriacao>();
    orcamento.listaOrcamentoCotacaoDto.forEach(opcao=>{
      opcao.formaPagto.forEach(p => {
        formaPagtoOrcamento.push(p);
      })
    })

    this.formaPagtoService.buscarFormaPagto(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo, comIndicacao)
      .toPromise()
      .then((r) => {
        if (r != null) {
          this.formaPagamento = r;
          this.novoOrcamentoService.atribuirOpcaoPagto(formaPagtoOrcamento, this.formaPagamento);
        }
      }).catch((e) => this.alertaService.mostrarErroInternet(e));
  }

  obterListaMensagem(idOrcamentoCotacao: number) {

    this.orcamentoCotacaoMensagemService.obterListaMensagem(idOrcamentoCotacao.toString()).toPromise().then((r) => {
      if (r != null) {

        this.listaMensagens = r;

      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  enviarMensagem() {

    let msg = new MensageriaDto();

    msg.IdOrcamentoCotacao = this.idOrcamentoCotacao.toString();
    msg.Mensagem = this.mensagem.nativeElement.value;
    msg.IdTipoUsuarioContextoRemetente = "1";
    msg.IdTipoUsuarioContextoDestinatario = "1";
    msg.IdUsuarioRemetente = this.idUsuarioRemetente;
    msg.IdUsuarioDestinatario = this.idUsuarioDestinatario;

    this.orcamentoCotacaoMensagemService.enviarMensagem(msg).toPromise().then((r) => {
      if (r != null) {
        this.mensagemService.showSuccessViaToast("Mensagem enviada sucesso!");
        this.obterListaMensagem(2);
        this.mensagem.nativeElement.value = '';
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  activeState: boolean[] = [false, false, false];
  toggle(index: number) {
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  aprovar(orcamento) {
    if (!this.opcaoPagto) {
    }
    this.sweetalertService.confirmarAprovacao("Deseja aprovar essa opção?", "").subscribe(result => {

    });
  }

  voltar() {
    this.novoOrcamentoService.orcamentoCotacaoDto=new OrcamentoCotacaoResponse();
    this.location.back();
  }

}
