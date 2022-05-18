
import { environment } from 'src/environments/environment';
import { AfterViewInit, Injectable } from '@angular/core';
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
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { MensageriaComponent } from 'src/app/views/mensageria/mensageria.component';


@Component({
  selector: 'app-aprovar-orcamento',
  templateUrl: './aprovar-orcamento.component.html',
  styleUrls: ['./aprovar-orcamento.component.scss']
})
export class AprovarOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  constructor(private readonly orcamentoService: OrcamentosService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    telaDesktopService: TelaDesktopService,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private readonly formaPagtoService: FormaPagtoService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly autenticacaoService: AutenticacaoService) {
    super(telaDesktopService);
  }
  public form: FormGroup;
  listaMensagens: MensageriaDto[];
  dataUtils: DataUtils = new DataUtils();

  vendedor: boolean;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  public mascaraTelefone: string;
  formataTelefone = new FormataTelefone();
  usuarioLogado: Usuario;

  @ViewChild("mensagemComponente", { static: false }) mensagemComponente: MensageriaComponent;

  idOrcamentoCotacao: number;
  ngOnInit(): void {
    this.formataTelefone = FormataTelefone.mascaraTelefoneTexto;
    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;







    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
    });

    this.buscarOrcamento(this.idOrcamentoCotacao);
    this.buscarFormasPagto();
    this.buscarDadosParaMensageria(this.idOrcamentoCotacao);
  }

  ngAfterViewInit() {
    this.mensagemComponente.obterListaMensagem(this.idOrcamentoCotacao);

  }

  @Input() desabiltarBotoes: boolean;

  // opcoesOrcamento: OpcoesOrcamentoCotacaoDto = new OpcoesOrcamentoCotacaoDto();
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;

  buscarDadosParaMensageria(id: number) {
    if (this.autenticacaoService._usuarioLogado) {
      this.orcamentoService.buscarDadosParaMensageria(id, true).toPromise().then((r) => {
        if (r != null) {
          this.mensagemComponente.idOrcamentoCotacao = r.idOrcamentoCotacao;
          this.mensagemComponente.idUsuarioRemetente = r.idUsuarioRemetente.toString();
          this.mensagemComponente.idTipoUsuarioContextoRemetente = r.idTipoUsuarioContextoRemetente.toString();
          this.mensagemComponente.idUsuarioDestinatario = r.idUsuarioDestinatario.toString();
          this.mensagemComponente.idTipoUsuarioContextoDestinatario = r.idTipoUsuarioContextoDestinatario.toString();
        }
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
      })
    }
  }

  buscarOrcamento(id: number) {
    this.novoOrcamentoService.criarNovo();
    this.orcamentoService.buscarOrcamento(id).toPromise().then(r => {
      if (r != null) {
        this.novoOrcamentoService.orcamentoCotacaoDto = r;
        if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro) {
          this.buscarParceiro(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
        }
      }
    });
  }

  razaoSocialParceiro: string;
  buscarParceiro(apelido) {
    this.orcamentistaIndicadorService.buscarParceiroPorApelido(apelido).toPromise().then((r) => {
      if (r != null) {
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
    orcamento.listaOrcamentoCotacaoDto.forEach(opcao => {
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
    this.novoOrcamentoService.orcamentoCotacaoDto = new OrcamentoCotacaoResponse();
    this.location.back();
  }

}
