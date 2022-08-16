
import { AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensageriaDto } from 'src/app/dto/mensageria/mensageria';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { MensageriaComponent } from 'src/app/views/mensageria/mensageria.component';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';


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
    private readonly mensagemService: MensagemService,
    private readonly sweetalertService: SweetalertService,
    private readonly activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private readonly formaPagtoService: FormaPagtoService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly autenticacaoService: AutenticacaoService,
    private router: Router) {
    super(telaDesktopService);
  }
  public form: FormGroup;
  public mascaraTelefone: string;
  listaMensagens: MensageriaDto[];
  dataUtils: DataUtils = new DataUtils();
  vendedor: boolean;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  formataTelefone: FormataTelefone;
  usuarioLogado: Usuario;
  idOrcamentoCotacao: number;
  razaoSocialParceiro: string;
  formaPagamento: FormaPagto[] = new Array();
  activeState: boolean[] = [false, false, false];
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  opcaoPagto: number;
  @Input() desabiltarBotoes: boolean;
  @ViewChild("mensagemComponente", { static: false }) mensagemComponente: MensageriaComponent;
  exibeBotaoEditar: boolean;
  exibeBotaoCancelar: boolean;
  exibeBotaoProrrogar: boolean;
  exibeBotaoNenhumaOpcao: boolean;
  items: MenuItem[];
  condicoesGerais: string;
  statusOrcamento: string;

  ngOnInit(): void {
    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
    });

    this.novoOrcamentoService.usuarioLogado = this.autenticacaoService.getUsuarioDadosToken();
    this.buscarOrcamento(this.idOrcamentoCotacao);

    this.buscarDadosParaMensageria(this.idOrcamentoCotacao);
    //this.carrregarBotoneira();    
  }

  ngAfterViewInit() {
    this.mensagemComponente.obterListaMensagem(this.idOrcamentoCotacao);
    this.buscarDadosParaMensageria(this.idOrcamentoCotacao);
    this.buscarParametros(12);

  }

  carrregarBotoneira() {

    this.exibeBotaoNenhumaOpcao = false;
    //Regras para Edição
    if (this.novoOrcamentoService.orcamentoCotacaoDto && this.editarDadosCadastrais) {
      this.exibeBotaoEditar = true;
    } else {
      this.exibeBotaoEditar = false;
    }

    //Regras para Cancelamento [2] = cancelado [3] = aprovado
    if (this.novoOrcamentoService.orcamentoCotacaoDto.status != 2 &&
      this.novoOrcamentoService.orcamentoCotacaoDto.status != 3) {
      this.exibeBotaoCancelar = true;
      this.exibeBotaoProrrogar = true;

    } else {
      this.exibeBotaoCancelar = false;
      this.exibeBotaoProrrogar = false;
    }

    if (!this.exibeBotaoCancelar && !this.exibeBotaoProrrogar && !this.exibeBotaoEditar) {
      this.exibeBotaoNenhumaOpcao = true;
    }

    this.items = [
      {
        label: 'Editar', icon: 'pi pi-fw pi-user-edit',
        visible: this.exibeBotaoEditar,
        command: () => this.editarDadosCliente(this.novoOrcamentoService.orcamentoCotacaoDto)
      },
      {
        label: 'Cancelar',
        icon: 'pi pi-fw pi-times',
        visible: this.exibeBotaoCancelar,
        command: () => this.cancelar()
      },
      {
        label: 'Prorrogar',
        icon: 'pi pi-fw pi-calendar-times',
        visible: this.exibeBotaoProrrogar,
        command: () => this.prorrogar()
      }
      ,
      {
        label: 'Nenhuma',
        visible: this.exibeBotaoNenhumaOpcao
      }

    ];

  }

  retornarSimOuNao(data: any) {
    if (data == true) {
      return "Sim";
    } else {
      return "Não";
    }
  }

  retornarTipoPessoa(data: any) {
    if (data == 'PF') {
      return "Pessoa física";
    } else {
      return "Pessoa jurídica";
    }
  }

  retornarContibuinteICMS(data: any) {
    switch (data) {
      case 1:
        return 'Sim';
        break;
      case 2:
        return 'Não';
        break;
      case 3:
        return 'Isento';
        break;

      default:
        return 'Indisponível';
        break;
    }
  }

  buscarParametros(id: number) {

    if (this.autenticacaoService._usuarioLogado) {
      this.orcamentoService.buscarParametros(id,this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
          this.condicoesGerais = r[0]['Valor'];
        }
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
      })
    }
  }

  buscarStatus(id: any) {

    if (this.autenticacaoService._usuarioLogado) {
      this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise().then((r) => {
        var indice = 0;
        if (r != null) {
          while (indice <= r.length) {
            if (r[indice]['Id'] == id) {
              this.statusOrcamento = r[indice]['Value'];
              break;
            }
            indice++;
          }
        }
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
      })
    }
  }


  buscarDadosParaMensageria(id: number) {

    if (this.autenticacaoService._usuarioLogado) {
      this.orcamentoService.buscarDadosParaMensageria(id, true).toPromise().then((r) => {
        if (r != null) {

          this.mensagemComponente.idOrcamentoCotacao = r.idOrcamentoCotacao;
          this.mensagemComponente.idUsuarioRemetente = r.idUsuarioRemetente.toString();
          this.mensagemComponente.idTipoUsuarioContextoRemetente = r.idTipoUsuarioContextoRemetente.toString();
          this.idUsuarioDestinatario = r.idUsuarioDestinatario.toString();
          this.mensagemComponente.idUsuarioDestinatario = r.idUsuarioDestinatario.toString();
          this.mensagemComponente.donoOrcamento = r.donoOrcamento;
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
        this.buscarStatus(this.novoOrcamentoService.orcamentoCotacaoDto.status);
        this.verificarEdicao();
        this.carrregarBotoneira();
        if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro) {
          this.buscarParceiro(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
        }
        this.buscarFormasPagto();
      }
    });
  }

  verificarAlcadaUsuario(idOpcao: number): boolean {
    return this.novoOrcamentoService.verificarAlcadaUsuario(idOpcao);
  }

  editarDadosCadastrais: boolean = false;
  verificarEdicaoDadosCadastraris(): boolean {
    if (this.editar) {
      let donoOrcamento = this.novoOrcamentoService.VerificarUsuarioLogadoDonoOrcamento();
      if (donoOrcamento.toLocaleLowerCase() == this.autenticacaoService.usuario.nome.toLocaleLowerCase()) return true;
    }
    return false;
  }

  editar: boolean = false;
  verificarEdicao() {
    this.editar = this.novoOrcamentoService.verificarEdicao();
    this.editarDadosCadastrais = this.verificarEdicaoDadosCadastraris();
  }

  buscarParceiro(apelido) {
    this.orcamentistaIndicadorService.buscarParceiroPorApelido(apelido).toPromise().then((r) => {
      if (r != null) {
        this.razaoSocialParceiro = r.razaoSocial;
      }
    })
  }

  buscarFormasPagto() {
    let orcamento = this.novoOrcamentoService.orcamentoCotacaoDto;
    let comIndicacao: number = 0;
    let tipoUsuario: number = this.autenticacaoService._tipoUsuario;
    let apelido: string = this.autenticacaoService.usuario.nome;
    if (orcamento.parceiro != null) {
      comIndicacao = 1;
      tipoUsuario = this.constantes.USUARIO_PERFIL_PARCEIRO_INDICADOR;
      apelido = orcamento.parceiro;
    }

    let formaPagtoOrcamento = new Array<FormaPagtoCriacao>();
    orcamento.listaOrcamentoCotacaoDto.forEach(opcao => {
      opcao.formaPagto.forEach(p => {
        formaPagtoOrcamento.push(p);
      })
    });

    this.formaPagtoService.buscarFormaPagto(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo,
      comIndicacao, tipoUsuario, apelido)
      .toPromise()
      .then((r) => {
        if (r != null) {
          this.formaPagamento = r;
          this.novoOrcamentoService.atribuirOpcaoPagto(formaPagtoOrcamento, this.formaPagamento);
        }
      }).catch((e) => this.alertaService.mostrarErroInternet(e));
  }

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
    this.sweetalertService.dialogo("","Deseja aprovar essa opção?").subscribe(result => {

    });
  }

  prorrogar() {
    this.sweetalertService.dialogo("","Deseja prorrogar esse orçamento?").subscribe(result => {
      if (!result) return;

      this.orcamentoService.prorrogarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id, this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          } else {
            if (r?.mensagem?.includes('|')) {
              let msg = r.mensagem.split('|');
              console.log(msg);
              console.log(this.novoOrcamentoService.orcamentoCotacaoDto.validade);
              this.mensagemService.showSuccessViaToast(msg[1]);
              this.novoOrcamentoService.orcamentoCotacaoDto.validade = msg[0];
            }
          }
        }
      }).catch((e) => this.alertaService.mostrarErroInternet(e));

    });
  }

  cancelar() {
    this.sweetalertService.dialogo("", "Confirma o cancelamento do orçamento?").subscribe(result => {
      if (!result) return;

      this.orcamentoService.cancelarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

        }
        // window.location.reload();
        this.ngOnInit();
      }).catch((e) => this.alertaService.mostrarErroInternet(e));

    });
  }

  voltar() {
    this.novoOrcamentoService.orcamentoCotacaoDto = new OrcamentoCotacaoResponse();
    this.location.back();
  }

  editarOpcao(orcamento) {
    this.router.navigate(["orcamentos/editar/editar-opcao", orcamento.id]);
  }

  editarDadosCliente(orcamento) {
    this.router.navigate(["orcamentos/editar/editar-cliente"]);
  }
}
