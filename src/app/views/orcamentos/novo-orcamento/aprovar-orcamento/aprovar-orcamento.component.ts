
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
import { RemetenteDestinatarioResponse } from 'src/app/service/mensageria/remetenteDestinatarioResponse';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';


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
  @ViewChild("mensagemComponente", { static: true }) mensagemComponente: MensageriaComponent;
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
  carregando: boolean = true;
  editarOpcoes = new Array<boolean>();


  ngOnInit(): void {
    this.novoOrcamentoService.criarNovo();
    this.novoOrcamentoService.criarNovoOrcamentoItem();

    this.imgUrl = this.produtoCatalogoService.imgUrl;

    this.idOrcamentoCotacao = this.activatedRoute.snapshot.params.id;

    this.activatedRoute.params.subscribe(params => {
      this.desabiltarBotoes = params["aprovando"] == "false" ? true : false;
    });

    this.novoOrcamentoService.usuarioLogado = this.autenticacaoService.getUsuarioDadosToken();

    const promises = [this.buscarPermissoes(),
    this.buscarOrcamento(),
    this.buscarDadosParaMensageria(),
    this.buscarParametros(),
    this.buscarStatus(), 
    this.mensagemComponente.buscarListaMensagem(this.idOrcamentoCotacao)];

    Promise.all(promises).then((r) => {
      this.setarPermissoes(r[0]);
      this.setarOrcamento(r[1]);
      this.setarDadosParaMensageria(r[2]);
      this.setarParametros(r[3]);
      this.setarStatus(r[1].status, r[4]);
      this.mensagemComponente.setarListaMensagem(this.idOrcamentoCotacao, r[5]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      // this.carregando = false;
    }).finally(() => {
      // this.carregando = false;
    });
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

  buscarPermissoes(): Promise<PermissaoOrcamentoResponse> {
    return this.permissaoService.buscarPermissaoOrcamento(this.idOrcamentoCotacao).toPromise();
  }

  buscarOrcamento(): Promise<OrcamentoCotacaoResponse> {
    return this.orcamentoService.buscarOrcamento(this.idOrcamentoCotacao).toPromise();
  }

  buscarDadosParaMensageria(): Promise<RemetenteDestinatarioResponse> {
    if (this.autenticacaoService._usuarioLogado)
      return this.orcamentoService.buscarDadosParaMensageria(this.idOrcamentoCotacao, true).toPromise();
  }

  buscarParametros(): Promise<any> {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_TextoFixo_CondicoesGerais, this.autenticacaoService._lojaLogado, null).toPromise();
  }

  buscarStatus(): Promise<any> {
    return this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise()
  }

  buscarParceiro(): Promise<OrcamentistaIndicadorDto> {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro)
      return this.orcamentistaIndicadorService.buscarParceiroPorApelido(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro).toPromise();

    return;
  }

  buscarFormasPagto(tipoCliente, comIndicacao, tipoUsuario, apelido, apelidoParceiro): Promise<FormaPagto[]> {
    return this.formaPagtoService.buscarFormaPagto(tipoCliente, comIndicacao, tipoUsuario, apelido, apelidoParceiro).toPromise();
  }

  setarPermissoes(response: PermissaoOrcamentoResponse) {
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
  }

  setarOrcamento(r: OrcamentoCotacaoResponse) {
    this.novoOrcamentoService.criarNovo();
    if (r != null) {

      this.novoOrcamentoService.orcamentoCotacaoDto = r;
      this.editarOpcoes = this.verificarEdicaoOpcao(r);

      let orcamento = r;
      let comIndicacao: number = 0;
      let tipoUsuario: number = this.autenticacaoService._tipoUsuario;
      let apelido: string = this.autenticacaoService.usuario.nome;
      let apelidoParceiro: string;

      if (orcamento.cadastradoPor == orcamento.vendedor) {
        tipoUsuario = this.constantes.VENDEDOR_UNIS;
        apelido = orcamento.vendedor;
        if (orcamento.parceiro != null) {
          comIndicacao = 1;
          apelidoParceiro = orcamento.parceiro;
        }
        else {
          comIndicacao = 0;
        }
      }
      if (orcamento.cadastradoPor == orcamento.parceiro || orcamento.cadastradoPor == orcamento.vendedorParceiro) {
        comIndicacao = 1;
        tipoUsuario = this.constantes.PARCEIRO;
        apelido = orcamento.parceiro;
        apelidoParceiro = orcamento.parceiro;
      }

      this.carregando = true;
      const promises: any[] = [this.buscarParceiro(), this.buscarFormasPagto(orcamento.clienteOrcamentoCotacaoDto.tipo, comIndicacao,
        tipoUsuario, apelido, apelidoParceiro)];

      Promise.all(promises).then((r) => {
        this.setarParceiro(r[0]);
        this.setarFormaPagto(r[1]);
      }).catch((e) => {
        this.carregando = false;
      }).finally(() => {
        this.carregando = false;
      });
    }
  }

  setarDadosParaMensageria(r: RemetenteDestinatarioResponse) {
    if (r != null) {

      if (this.novoOrcamentoService.permiteEnviarMensagem(r.validade, r.dataMaxTrocaMsg)) {
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
  }

  setarParametros(r: any) {
    if (r != null) {
      this.condicoesGerais = r[0]['Valor'];
    }
  }

  setarStatus(idStatus: number, r: any) {
    var indice = 0;
    if (r != null) {

      let dataAtual = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      let validade = this.novoOrcamentoService.orcamentoCotacaoDto.validade;
      let dataValidade = new Date(new Date(validade).getFullYear(), new Date(validade).getMonth(), new Date(validade).getDate());

      if (idStatus == 1 && dataValidade < dataAtual) {
        this.statusOrcamento = "Expirado";
        return;
      }
      while (indice <= r.length) {
        if (r[indice]['Id'] == idStatus) {
          this.statusOrcamento = r[indice]['Value'];
          break;
        }
        indice++;
      }
    }
  }

  setarParceiro(r: OrcamentistaIndicadorDto) {
    if (r != null) {
      this.razaoSocialParceiro = r.razaoSocial;
      this.mostrarInstaladorInstala = true;
    }
  }

  setarFormaPagto(r: FormaPagto[]) {
    if (r != null) {
      this.formaPagamento = r;
      this.novoOrcamentoService.atribuirOpcaoPagto(new Array<FormaPagtoCriacao>(), this.formaPagamento);
      this.carregando = false;
    }
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

  verificarEdicaoOpcao(orcamento: OrcamentoCotacaoResponse): Array<boolean> {

    let permissaoEdicao = this.permissaoOrcamentoResponse.EditarOpcaoOrcamento;
    let opcoes = new Array<boolean>();
    for (let i = 0; i < orcamento.listaOrcamentoCotacaoDto.length; i++) {
      let alcadaUsuario = this.novoOrcamentoService.verificarAlcadaUsuario(orcamento.listaOrcamentoCotacaoDto[i].id);
      if (permissaoEdicao && alcadaUsuario) opcoes.push(true);
      else opcoes.push(false);
    }

    return opcoes;
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
      this.carregando = true;
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
        this.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.carregando = false;
      });
    });
  }

  cancelar() {
    this.sweetalertService.dialogo("", "Confirma o cancelamento do orçamento?").subscribe(result => {
      if (!result) return;
      this.carregando = true;
      this.orcamentoService.cancelarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

        }
        this.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.carregando = false;
      });

    });
  }

  reenviarOrcamento() {
    this.sweetalertService.dialogo("", "Confirma o reenvio do orçamento?").subscribe(result => {
      if (!result) return;
      this.carregando = true;
      this.orcamentoService.reenviarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {

          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

          if (r.tipo == "SUCCESS") {
            this.mensagemService.showSuccessViaToast(r.mensagem);
          }

        }
        this.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.carregando = false; 
      });

    });
  }

  voltar() {
    this.novoOrcamentoService.orcamentoCotacaoDto = new OrcamentoCotacaoResponse();
    sessionStorage.setItem("urlAnterior", this.router.url);
    this.location.back();
  }

  editarOpcao(orcamento) {
    this.router.navigate(["orcamentos/editar/editar-opcao", orcamento.id]);
  }

  editarDadosCliente(orcamento) {
    this.router.navigate(["orcamentos/editar/editar-cliente"]);
  }

  copiarLink() {

    const copiar = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', this.novoOrcamentoService.orcamentoCotacaoDto.link);
      e.preventDefault();
    };
    document.addEventListener('copy', copiar);
    document.execCommand('copy');
    document.removeEventListener('copy', copiar);
    this.mensagemService.showSuccessViaToast("Link copiado com sucesso!");
  }
}
