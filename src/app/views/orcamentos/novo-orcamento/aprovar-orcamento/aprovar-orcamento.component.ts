
import { AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { Constantes } from 'src/app/utilities/constantes';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { ProdutoCatalogoService } from '../../../../service/produtos-catalogo/produto.catalogo.service'
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
import { PermissaoService } from 'src/app/service/permissao/permissao.service';
import { PermissaoOrcamentoResponse } from 'src/app/dto/permissao/PermissaoOrcamentoResponse';


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
    private readonly permissaoService: PermissaoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly produtoCatalogoService: ProdutoCatalogoService,
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
  exibeBotaoClonar: boolean;
  exibeBotaoReenviar: boolean;
  items: MenuItem[];
  condicoesGerais: string;
  statusOrcamento: string;
  habilitaBotaoAprovar: boolean;
  permissaoOrcamentoResponse: PermissaoOrcamentoResponse;
  editar: boolean = false;
  imgUrl: string;
  mostrarInstaladorInstala: boolean;
  carregando:boolean = true;

  ngOnInit(): void {

    this.imgUrl = this.produtoCatalogoService.imgUrl;

    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;

    this.permissaoService.buscarPermissaoOrcamento(this.idOrcamentoCotacao).toPromise().then(response => {

      this.permissaoOrcamentoResponse = response;

      if (!this.permissaoOrcamentoResponse.Sucesso) {
        this.sweetalertService.aviso(this.permissaoOrcamentoResponse.Mensagem);
        this.router.navigate(['orcamentos/listar/orcamentos']);
        return;
      }

      if (!this.permissaoOrcamentoResponse.VisualizarOrcamento) {
        this.sweetalertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
        this.router.navigate(['orcamentos/listar/orcamentos']);
        return;
      }

      this.exibeBotaoProrrogar = this.permissaoOrcamentoResponse.ProrrogarOrcamento;
      this.exibeBotaoEditar = this.permissaoOrcamentoResponse.EditarOrcamento;
      this.exibeBotaoCancelar = this.permissaoOrcamentoResponse.CancelarOrcamento;
      this.habilitaBotaoAprovar = this.permissaoOrcamentoResponse.DesabilitarAprovarOpcaoOrcamento;
      this.exibeBotaoClonar = this.permissaoOrcamentoResponse.ClonarOrcamento;
      this.exibeBotaoNenhumaOpcao = this.permissaoOrcamentoResponse.NenhumaOpcaoOrcamento;
      this.exibeBotaoReenviar = this.permissaoOrcamentoResponse.ReenviarOrcamento;
      this.desabiltarBotoes = this.permissaoOrcamentoResponse.DesabilitarBotoes;
      
      this.carrregarBotoneira();
    }).catch((response) => this.alertaService.mostrarErroInternet(response));

    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
    });

    this.novoOrcamentoService.usuarioLogado = this.autenticacaoService.getUsuarioDadosToken();
    this.buscarOrcamento(this.idOrcamentoCotacao);

    this.buscarDadosParaMensageria(this.idOrcamentoCotacao);
  }

  ngAfterViewInit() {
    this.mensagemComponente.obterListaMensagem(this.idOrcamentoCotacao);
    this.buscarDadosParaMensageria(this.idOrcamentoCotacao);
    this.buscarParametros(12);
  }

  carrregarBotoneira() {

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
      },
      {
        label: 'Clonar',
        icon: 'pi pi-fw pi-copy',
        visible: this.exibeBotaoClonar,
        command: () => this.clonarOrcamento()
      },
      {
        label: 'Reenviar',
        icon: 'pi pi-fw pi-send',
        visible: this.exibeBotaoReenviar,
        command: () => this.reenviarOrcamento()
      },
      {
        label: 'Nenhuma',
        visible: this.exibeBotaoNenhumaOpcao
      }

    ];

  }

  clonarOrcamento() {
    this.idOrcamentoCotacao;
    this.router.navigate(["orcamentos/cadastrar-cliente", "clone"]);
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
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM:
        return 'Sim';
        break;
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO:
        return 'Não';
        break;
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO:
        return 'Isento';
        break;

      default:
        return 'Indisponível';
        break;
    }
  }

  retornarInstaldorInstala(instaladorInstala: number) {
    if (instaladorInstala == this.constantes.COD_INSTALADOR_INSTALA_NAO) return "Não";
    if (instaladorInstala == this.constantes.COD_INSTALADOR_INSTALA_SIM) return "Sim";
  }

  buscarParametros(id: number) {

    if (this.autenticacaoService._usuarioLogado) {
      this.orcamentoService.buscarParametros(id, this.autenticacaoService._lojaLogado, null).toPromise().then((r) => {
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

          if (this.novoOrcamentoService.permiteEnviarMensagem(r.status, r.validade)) {
            this.mensagemComponente.permiteEnviarMensagem = true;
          } else {
            this.mensagemComponente.permiteEnviarMensagem = false;
          }

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
        debugger;
        this.novoOrcamentoService.orcamentoCotacaoDto = r;

        this.buscarStatus(this.novoOrcamentoService.orcamentoCotacaoDto.status);
        if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro) {
          this.buscarParceiro(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
        }
        this.buscarFormasPagto();
        this.editarOpcoes = this.verificarEdicaoOpcao(r);
        
      }
    }).catch((e) =>{
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }


  editarOpcoes = new Array<boolean>();
  verificarEdicaoOpcao(orcamento: OrcamentoCotacaoResponse):Array<boolean> {
    let permissaoEdicao = this.permissaoOrcamentoResponse.EditarOpcaoOrcamento;
    let opcoes = new Array<boolean>();
    for (let i = 0; i < orcamento.listaOrcamentoCotacaoDto.length; i++) {
      let alcadaUsuario = this.novoOrcamentoService.verificarAlcadaUsuario(orcamento.listaOrcamentoCotacaoDto[i].id);
      if (permissaoEdicao && alcadaUsuario) opcoes.push(true);
      else opcoes.push(false);
    }

    return opcoes;
  }

  buscarParceiro(apelido) {
    this.orcamentistaIndicadorService.buscarParceiroPorApelido(apelido).toPromise().then((r) => {
      if (r != null) {
        this.razaoSocialParceiro = r.razaoSocial;
        this.mostrarInstaladorInstala = true;
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

    this.formaPagtoService.buscarFormaPagto(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo,
      comIndicacao, tipoUsuario, apelido)
      .toPromise()
      .then((r) => {
        if (r != null) {
          this.formaPagamento = r;
          this.novoOrcamentoService.atribuirOpcaoPagto(formaPagtoOrcamento, this.formaPagamento);
          this.carregando = false;
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
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.AprovarOrcamento)) return;

    if (!this.opcaoPagto) {
    }
    this.sweetalertService.aviso("Funcionalidade não implementada.");
    /*this.sweetalertService.dialogo("", "Deseja aprovar essa opção?").subscribe(result => {

    });*/
  }

  prorrogar() {

    if (!this.autenticacaoService.verificarPermissoes(ePermissao.ProrrogarVencimentoOrcamento)) return;

    this.sweetalertService.dialogo("", "Deseja prorrogar esse orçamento?").subscribe(result => {
      if (!result) return;

      this.orcamentoService.prorrogarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id, this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          } else {
            if (r?.mensagem?.includes('|')) {
              let msg = r.mensagem.split('|');
              this.mensagemService.showSuccessViaToast(msg[1]);
              this.novoOrcamentoService.orcamentoCotacaoDto.validade = msg[0];
            }
          }
        }
        this.ngOnInit();
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

  reenviarOrcamento() {
    this.sweetalertService.dialogo("", "Confirma o reenvio do orçamento?").subscribe(result => {
      if (!result) return;

      this.orcamentoService.reenviarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {

          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

          if (r.tipo == "SUCCESS") {
            this.mensagemService.showSuccessViaToast(r.mensagem);
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
