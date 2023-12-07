
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
import jsPDF from 'jspdf';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { ScrollPanel } from 'primeng/scrollpanel';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';
import { AppComponent } from 'src/app/main/app.component';
import { MensagemDto } from 'src/app/dto/MensagemDto';

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
    private router: Router,
    private readonly appComponent: AppComponent) {
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
  activeState: boolean[] = [];
  moedaUtils: MoedaUtils = new MoedaUtils();
  stringUtils = StringUtils;
  constantes: Constantes = new Constantes();
  @Input() desabiltarBotoes: boolean;
  @ViewChild("mensagemComponente", { static: true }) mensagemComponente: MensageriaComponent;
  exibeBotaoEditar: boolean;
  exibeBotaoCancelar: boolean;
  exibeBotaoProrrogar: boolean;
  exibeBotaoNenhumaOpcao: boolean;
  exibeBotaoClonar: boolean;
  exibeBotaoReenviar: boolean;
  exibeBotaoExcluir: boolean;
  exibeBotaoAnular: boolean;
  items: MenuItem[];
  condicoesGerais: string;
  statusOrcamento: string;
  habilitaBotaoAprovar: boolean;
  permissaoOrcamentoResponse: PermissaoOrcamentoResponse;
  editar: boolean = false;
  imgUrl: string;
  mostrarInstaladorInstala: boolean;
  editarOpcoes = new Array<boolean>();
  imagem: any;
  fraseEstoque: string;
  fraseFrete: string;

  ngOnInit(): void {

    this.mensagemComponente.carregando = true;
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
    this.buscarParametrosCondicoesGerais(),
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
      this.mensagemComponente.carregando = false;
    }).finally(() => {
      this.Promise2();
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
        label: 'Excluir', icon: 'pi pi-fw pi-trash',
        visible: this.exibeBotaoExcluir,
        command: () => this.excluirOrcamento()
      },
      {
        label: 'Anular', icon: 'pi pi-fw pi-trash',
        visible: this.exibeBotaoAnular,
        command: () => this.anularOrcamentoAprovado()
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

  buscarParametrosCondicoesGerais(): Promise<any> {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_TextoFixo_CondicoesGerais, this.autenticacaoService._lojaLogado, null).toPromise();
  }

  buscarParametroLogoImpressao(loja: string): Promise<any> {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Orcamento_LogoPdf, loja, null).toPromise();
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

  buscarParametroFraseEstoque(loja: string) {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_MedianteConfirmacaoEstoque, loja, null).toPromise();
  }

  buscarParametroFraseFrete(loja: string) {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_Frete, loja, null).toPromise();
  }

  buscarParametroEmailBoleto() {
    return this.orcamentoService.buscarParametroEmailBoleto("interno").toPromise();
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
    this.exibeBotaoExcluir = this.permissaoOrcamentoResponse.ExcluirOrcamento;
    this.exibeBotaoAnular = this.permissaoOrcamentoResponse.AnularOrcamentoAprovado;

    this.carrregarBotoneira();
  }

  setarOrcamento(r: OrcamentoCotacaoResponse) {
    this.novoOrcamentoService.criarNovo();
    if (r != null) {

      this.novoOrcamentoService.orcamentoCotacaoDto = r;

      this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.forEach(x => {
        this.activeState.push(true);
      });

      this.verificarDisponibilidadeOrcamento();
      this.verificarFormasPagtos();
      this.verificarOpcaoAprovada();
    }
  }

  Promise2() {
    let orcamento = this.novoOrcamentoService.orcamentoCotacaoDto;
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

    const promises: any[] = [this.buscarParceiro(),
    this.buscarFormasPagto(orcamento.clienteOrcamentoCotacaoDto.tipo, comIndicacao,
      tipoUsuario, apelido, apelidoParceiro),
    this.mensagemComponente.marcarMensagemComoLida(this.idOrcamentoCotacao),
    this.buscarParametroLogoImpressao(orcamento.loja), this.buscarParametroFraseEstoque(orcamento.loja),
    this.buscarParametroFraseFrete(orcamento.loja),
    this.buscarFormasPagto(orcamento.clienteOrcamentoCotacaoDto.tipo, comIndicacao,
      this.autenticacaoService._tipoUsuario, apelido, apelidoParceiro),
    this.buscarParametroEmailBoleto()];

    Promise.all(promises).then((r) => {
      this.setarParceiro(r[0]);
      this.setarFormaPagto(r[1]);
      this.setarImagemLogoImpressao(r[3][0].Valor);
      this.setarFraseEstoque(r[4][0].Valor);
      this.setarFraseFrete(r[5][0].Valor);
      this.editarOpcoes = this.validarEdicao(r[6]);
      this.setarParametroEmailBoleto(r[7]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.mensagemComponente.carregando = false;
    }).finally(() => {
      this.mensagemComponente.carregando = false;
      this.mensagemComponente.rolarChat();
    });
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
    }
  }

  setarImagemLogoImpressao(image: string) {
    this.imagem = `assets/layout/images/${image}`;
  }

  setarFraseEstoque(frase: string) {
    this.fraseEstoque = frase;
  }

  setarFraseFrete(frase: string) {
    this.fraseFrete = frase;
  }

  setarParametroEmailBoleto(response: MensagemDto) {
    if (!!response) {
      this.novoOrcamentoService.idMeioPagtoMonitorado = response.mensagem;
    }
  }

  validarEdicao(r: FormaPagto[]) {
    let opcoesEditar = this.verificarAlcadaEdicaoOpcao(this.novoOrcamentoService.orcamentoCotacaoDto);
    opcoesEditar = this.verificarFormaPagtoEdicaoOpcao(opcoesEditar, r);

    return opcoesEditar;
  }

  verificarFormaPagtoEdicaoOpcao(opcoesEditar: Array<boolean>, r: FormaPagto[]): Array<boolean> {
    //Comparar formas de pagtos por usuário com as formas de pagtos cadastradas nas opções
    //se não existir qualquer forma de pagto da opção, o usuário não pode editar a opção
    let opcoes = this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto;
    for (let i = 0; i < opcoes.length; i++) {
      for (let y = 0; y < opcoes[i].formaPagto.length; y++) {
        //se usuário não tiver permissão nem válida os pagamentos
        if (!opcoesEditar[i]) {
          continue;
        }

        let pagto = r.filter(p => p.idTipoPagamento == opcoes[i].formaPagto[y].tipo_parcelamento);
        if (pagto.length == 0) {
          opcoesEditar[i] = false;
          continue;
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
          let meio = pagto[0].meios.filter(m => m.id == opcoes[i].formaPagto[y].op_av_forma_pagto);
          if (meio.length == 0) {
            opcoesEditar[i] = false;
          }
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
          let maxQtdeParcelas = pagto[0].meios[0].qtdeMaxParcelas;
          if (!maxQtdeParcelas) {
            opcoesEditar[i] = true;
            continue;
          }

          let qtdeParcelas = opcoes[i].formaPagto[y].c_pc_qtde;
          if (qtdeParcelas > maxQtdeParcelas) {
            opcoesEditar[i] = false;
          }
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
          let meioPagtoEntrada = pagto[0].meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_ENTRADA &&
            x.id == Number.parseInt(opcoes[i].formaPagto[y].op_pce_entrada_forma_pagto));
          if (meioPagtoEntrada.length == 0) {
            opcoesEditar[i] = false;
            continue;
          }

          let meioPagtoDemaisPrestacoes = pagto[0].meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES &&
            x.id == Number.parseInt(opcoes[i].formaPagto[y].op_pce_prestacao_forma_pagto));
          if (meioPagtoDemaisPrestacoes.length > 0) {
            let maxQtdeParcelas = meioPagtoDemaisPrestacoes[0].qtdeMaxParcelas;
            if (!maxQtdeParcelas) {
              opcoesEditar[i] = true;
              continue;
            }

            let qtdeParcelasOpcao = opcoes[i].formaPagto[y].c_pce_prestacao_qtde;
            if (qtdeParcelasOpcao > maxQtdeParcelas) {
              opcoesEditar[i] = false;
              continue;
            }
            let maxQtdeDias = meioPagtoDemaisPrestacoes[0].qtdeMaxDias;
            if (!maxQtdeParcelas) {
              opcoesEditar[i] = true;
              continue;
            }

            let qtdeDiasOpcao = opcoes[i].formaPagto[y].c_pce_prestacao_periodo;
            if (qtdeDiasOpcao > maxQtdeDias) {
              opcoesEditar[i] = false;
            }
          }
          else {
            opcoesEditar[i] = false;
          }
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
          let meioPagtoPrimPrestacao = pagto[0].meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_PRIM_PRESTACOES &&
            x.id == Number.parseInt(opcoes[i].formaPagto[y].op_pse_prim_prest_forma_pagto));
          if (meioPagtoPrimPrestacao.length > 0) {
            let maxQtdeDias = meioPagtoPrimPrestacao[0].qtdeMaxDias;
            if (!maxQtdeDias) {
              opcoesEditar[i] = true;
              continue;
            }

            let qtdeDiasPrimOpcao = opcoes[i].formaPagto[y].c_pse_prim_prest_apos;
            if (qtdeDiasPrimOpcao > maxQtdeDias) {
              opcoesEditar[i] = false;
              continue;
            }
          }
          else {
            opcoesEditar[i] = false;
            continue;
          }

          let meioPagtoDemaisPrestacoes = pagto[0].meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES &&
            x.id == Number.parseInt(opcoes[i].formaPagto[y].op_pse_demais_prest_forma_pagto));
          if (meioPagtoDemaisPrestacoes.length > 0) {
            let maxQtdeDias = meioPagtoDemaisPrestacoes[0].qtdeMaxDias;
            if (!maxQtdeDias) {
              opcoesEditar[i] = true;
              continue;
            }

            let qtdeDiasDemaisPrestacoesOpcao = opcoes[i].formaPagto[y].c_pse_demais_prest_periodo;
            if (qtdeDiasDemaisPrestacoesOpcao > maxQtdeDias) {
              opcoesEditar[i] = false;
              continue;
            }

            let maxQtdeParcelas = meioPagtoDemaisPrestacoes[0].qtdeMaxParcelas;
            if (!maxQtdeParcelas) {
              opcoesEditar[i] = true;
              continue;
            }

            let qtdeParcelasDemaisPrestacoesOpcao = opcoes[i].formaPagto[y].c_pse_demais_prest_qtde;
            if (qtdeDiasDemaisPrestacoesOpcao > maxQtdeParcelas) {
              opcoesEditar[i] = false;
            }
          }
          else {
            opcoesEditar[i] = false;
          }
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
          let meioPagtoOpcao = pagto[0].meios.filter(x => x.id == Number.parseInt(opcoes[i].formaPagto[y].op_pu_forma_pagto));
          if (meioPagtoOpcao.length == 0) {
            opcoesEditar[i] = false;
            continue;
          }

          let maxQtdeDias = meioPagtoOpcao[0].qtdeMaxDias;
          if (!maxQtdeDias) {
            opcoesEditar[i] = true;
            continue;
          }

          let qtdeDiasOpcao = opcoes[i].formaPagto[y].c_pu_vencto_apos;
          if (qtdeDiasOpcao > maxQtdeDias) {
            opcoesEditar[i] = false;
          }
        }

        if (pagto[0].idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
          let maxQtdeParcelas = pagto[0].meios[0].qtdeMaxParcelas;
          if (!maxQtdeParcelas) {
            opcoesEditar[i] = true;
            continue;
          }

          let qtdeParcelas = opcoes[i].formaPagto[y].c_pc_maquineta_qtde;
          if (qtdeParcelas > maxQtdeParcelas) {
            opcoesEditar[i] = false;
          }
        }
      }
    }

    return opcoesEditar;
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

  verificarAlcadaEdicaoOpcao(orcamento: OrcamentoCotacaoResponse): Array<boolean> {

    let permissaoEdicao = this.permissaoOrcamentoResponse.EditarOpcaoOrcamento;
    let opcoes = new Array<boolean>();
    for (let i = 0; i < orcamento.listaOrcamentoCotacaoDto.length; i++) {
      let alcadaUsuario = this.novoOrcamentoService.verificarAlcadaUsuario(orcamento.listaOrcamentoCotacaoDto[i].id);
      if (permissaoEdicao && alcadaUsuario) opcoes.push(true);
      else opcoes.push(false);
    }

    return opcoes;
  }

  aprovar(opcaoSelecionada: OrcamentosOpcaoResponse) {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.AprovarOrcamento)) return;

    if (!opcaoSelecionada.pagtoSelecionado) {
      this.alertaService.mostrarMensagem("É necessário selecionar uma forma de pagamento!");
      return;
    }

    let orcamentoAprovacao = new AprovacaoOrcamentoDto();
    orcamentoAprovacao.idOpcao = opcaoSelecionada.id;
    orcamentoAprovacao.idFormaPagto = opcaoSelecionada.pagtoSelecionado.id;
    orcamentoAprovacao.idOrcamento = this.novoOrcamentoService.orcamentoCotacaoDto.id;
    orcamentoAprovacao.pagtoAprovadoTexto =
      opcaoSelecionada.pagtoSelecionado.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA ? "a vista" : "a prazo";
    orcamentoAprovacao.opcaoSequencia = opcaoSelecionada.sequencia;

    this.novoOrcamentoService.orcamentoAprovacao = orcamentoAprovacao;

    this.router.navigate(["orcamentos/cliente/busca", this.idOrcamentoCotacao]);
  }

  prorrogar() {

    if (!this.autenticacaoService.verificarPermissoes(ePermissao.ProrrogarVencimentoOrcamento)) return;

    this.sweetalertService.dialogo("", "Deseja prorrogar esse orçamento?").subscribe(result => {
      if (!result) return;
      this.mensagemComponente.carregando = true;
      this.orcamentoService.prorrogarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id, this.autenticacaoService._lojaLogado).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.alertaService.mostrarMensagem(r.mensagem);
          } else {
            if (r?.mensagem?.includes('|')) {
              let msg = r.mensagem.split('|');
              this.sweetalertService.sucesso(msg[1]);
              this.novoOrcamentoService.orcamentoCotacaoDto.validade = msg[0];
            }
          }
        }
        this.mensagemComponente.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.mensagemComponente.carregando = false;
      });
    });
  }

  cancelar() {
    this.sweetalertService.dialogo("", "Confirma o cancelamento do orçamento?").subscribe(result => {
      if (!result) return;
      this.mensagemComponente.carregando = true;
      this.orcamentoService.cancelarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {
          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

        }
        this.mensagemComponente.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.mensagemComponente.carregando = false;
      });

    });
  }

  reenviarOrcamento() {
    this.sweetalertService.dialogo("", "Confirma o reenvio do orçamento?").subscribe(result => {
      if (!result) return;
      this.mensagemComponente.carregando = true;
      this.orcamentoService.reenviarOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto.id).toPromise().then((r) => {
        if (r != null) {

          if (r.tipo == "WARN") {
            this.mensagemService.showWarnViaToast(r.mensagem);
          }

          if (r.tipo == "SUCCESS") {
            this.mensagemService.showSuccessViaToast(r.mensagem);
          }

        }
        this.mensagemComponente.carregando = false;
        this.ngOnInit();
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.mensagemComponente.carregando = false;
      });

    });
  }

  voltar() {
    if (this.router.url.indexOf('orcamentos/listar/orcamentos') != -1 &&
      this.router.url.indexOf('orcamentos/listar/pendentes') != -1 &&
      this.router.url.indexOf('orcamentos/listar/pedidos') != -1) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
    this.novoOrcamentoService.orcamentoCotacaoDto = new OrcamentoCotacaoResponse();

    debugger;
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

  TAB_SIZE = 10;
  NORMAL_FONT_SIZE = 10;
  TITLE_FONT_SIZE = 12;
  SMALL_FONT_SIZE = 8;

  CHECKBOX_SIZE = 6;

  FOOTER_MARGIN = this.SMALL_FONT_SIZE * 3;

  DELIVERY_ALERTS = [];

  generatePDF(image) {
    // Captura data de geração do PDF
    const generateDate = new Date();

    // Cria documento
    const doc = this.createPDF();

    //Adicionar um template de pagina
    let currentPositionY = this.addPageTemplate(doc, image);

    // Adicionar informações sobre o orçamento
    currentPositionY = this.addBudgetInfo(doc, currentPositionY, this.novoOrcamentoService.orcamentoCotacaoDto);

    // Adicionar informações sobre a entrega
    this.DELIVERY_ALERTS = [];
    this.DELIVERY_ALERTS.push(this.fraseEstoque);
    this.DELIVERY_ALERTS.push(this.fraseFrete);

    currentPositionY = this.addDeliveryInfo(
      doc,
      currentPositionY,
      this.novoOrcamentoService.orcamentoCotacaoDto,
      this.DELIVERY_ALERTS
    );

    // Loop para adicionar as opções disponíveis
    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.forEach((option, index) => {
      let optionTitle = `Opção ${index + 1}`;

      if (option.aprovado) {
        optionTitle = optionTitle + "   (Aprovada)";
      }

      // Adicionar opção
      let pagtos = {
        cashPayment: {
          paymentTitle: "",
          paymentLines: [],
          aprovado: false
        },
        installmentPayment: {
          paymentTitle: "",
          paymentLines: [],
          aprovado: false
        }
      }
      option.formaPagto.forEach((p) => {
        if (p.habilitado) {
          if (p.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
            let pagto = this.novoOrcamentoService.formatarFormaPagamentoImpressao(option, p);
            pagtos.cashPayment.paymentTitle = pagto.titulo;
            pagtos.cashPayment.paymentLines = pagto.linhasPagto;
            if (p.aprovado) {
              pagtos.cashPayment.aprovado = true;
            }
          }
          else {
            let pagto = this.novoOrcamentoService.formatarFormaPagamentoImpressao(option, p);
            pagtos.installmentPayment.paymentTitle = pagto.titulo;
            pagtos.installmentPayment.paymentLines = pagto.linhasPagto;
            if (p.aprovado) {
              pagtos.installmentPayment.aprovado = true;
            }
          }
        }
      });
      currentPositionY = this.addOption(
        doc,
        currentPositionY,
        option,
        optionTitle,
        pagtos
      );
    });

    // Adicionar informações de disclaimer
    this.addDisclaimer(doc, currentPositionY, this.condicoesGerais);

    // Adicionar informações no footer
    this.addPageFooter(doc, generateDate);

    doc.save(
      `${this.novoOrcamentoService.orcamentoCotacaoDto.id}_${this.getFormattedDateFileName(generateDate)}.pdf`
    );
  }

  getImageSizeAndGeneratePDF() {
    // this.getImageSize2(this.imagem);
    let img = new Image();
    img.src = this.imagem;

    this.getImageSize(this.imagem).then(({ source, height, width }) => {
      this.generatePDF({ source, height, width });
    });
  }

  // Função para pegar tamanho da imagem
  getImageSize(source: string): any {
    return new Promise((resolve) => {

      const image = new Image();
      image.onload = () => {
        const height = image.height * 0.25;
        const width = image.width * 0.25;

        resolve({ source, height, width });
      };
      image.src = source;
    });
  }

  //Função para criar documento PDF
  createPDF(): jsPDF {
    const doc = new jsPDF({
      orientation: "portrait",
      format: "a4",
      unit: "px",
    });

    doc.deletePage(1);
    return doc;
  }

  // Função para adicionar pagina template
  addPageTemplate(doc: jsPDF, image) {
    doc.addPage();

    // Adicionar imagem na primeira pagina
    if (doc.getNumberOfPages() === 1 && image?.source) {
      doc.addImage(
        image.source,
        "PNG",
        doc.internal.pageSize.width - image.width - this.TAB_SIZE,
        this.TAB_SIZE,
        image.width,
        image.height
      );
    }

    // Adicionar moldura do relatorio
    doc
      .setFillColor("#000")
      .rect(
        this.TAB_SIZE,
        this.TAB_SIZE,
        doc.internal.pageSize.width - 2 * this.TAB_SIZE,
        doc.internal.pageSize.height - 2 * this.TAB_SIZE,
        "S"
      );

    return 3 * this.TAB_SIZE;
  }

  // Função para adicionar informações sobre o orçamento
  addBudgetInfo(doc: jsPDF, currentPositionY: number, orcamento: OrcamentoCotacaoResponse) {
    currentPositionY = this.addTitle(doc, currentPositionY, "Dados do Orçamento", undefined);

    const budgetInfo = [
      ["Orçamento nº:", orcamento.id],
      ["Status:", this.statusOrcamento],
      ["Criado em:", this.getFormattedDate(new Date(orcamento.dataCadastro))],
      ["Válido até:", this.getFormattedDate(new Date(orcamento.validade))],
      ["Tipo de cliente:", this.retornarTipoPessoa(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo)],
    ];

    currentPositionY = this.addLabeledData(doc, currentPositionY, budgetInfo);

    currentPositionY += this.NORMAL_FONT_SIZE;

    const clientDescriptionText = `Aos cuidados de ${orcamento.clienteOrcamentoCotacaoDto.nomeCliente
      }${orcamento.clienteOrcamentoCotacaoDto.nomeObra ? ` (${orcamento.clienteOrcamentoCotacaoDto.nomeObra})` : ""}`;

    const maxClientDescriptionWidth = doc.internal.pageSize.width - 4 * this.TAB_SIZE;

    const clientDescriptionLines = doc
      .setFontSize(this.NORMAL_FONT_SIZE)
      .splitTextToSize(clientDescriptionText, maxClientDescriptionWidth);

    clientDescriptionLines.forEach((line) => {
      doc
        .setFontSize(this.NORMAL_FONT_SIZE)
        .text(line, 2 * this.TAB_SIZE, currentPositionY);

      currentPositionY += this.NORMAL_FONT_SIZE;
    });

    return (currentPositionY += 10);
  }

  // Função para adicionar informações sobre a entrega
  addDeliveryInfo(doc: jsPDF, currentPositionY: number, orcamento: OrcamentoCotacaoResponse, deliveryAlerts) {
    currentPositionY = this.addTitle(doc, currentPositionY, "Dados de Entrega", undefined);

    const deliveryInfo = [
      ["UF:", orcamento.clienteOrcamentoCotacaoDto.uf],
      [
        "Entrega imediata:",
        this.retornarSimOuNao(orcamento.entregaImediata),
      ]
    ];

    if (!orcamento.entregaImediata) {
      deliveryInfo.push(
        [
          "Entrega prevista para:",
          this.dataUtils.formata_data_DDMMYYY(orcamento.dataEntregaImediata),
        ]);
    }

    currentPositionY = this.addLabeledData(doc, currentPositionY, deliveryInfo);

    currentPositionY -= this.NORMAL_FONT_SIZE * deliveryInfo.length;

    // Adicionar aviso de entrega
    const maxAlertWidth = doc.internal.pageSize.width / 2 - 4 * this.TAB_SIZE;

    deliveryAlerts.forEach((alert) => {

      if (alert.indexOf("style=") > -1) {
        //é html
        let parser = new DOMParser();
        let html = parser.parseFromString(alert, 'text/html');
        let parag = html.getElementsByTagName("p");

        const alertLines = doc
          .setFontSize(this.NORMAL_FONT_SIZE)
          .setFont(undefined, "bold")
          .splitTextToSize(parag[0].innerText, maxAlertWidth);

        alertLines.forEach((line) => {
          doc
            .setTextColor(parag[0].style.color)
            .text(
              `${line}`,
              doc.internal.pageSize.width - 2 * this.TAB_SIZE,
              currentPositionY,
              { align: "right", maxWidth: maxAlertWidth, lineHeightFactor: Number.parseFloat(parag[0].style.lineHeight) }
            );
          currentPositionY += this.NORMAL_FONT_SIZE;
        });
      }
      else {
        const alertLines = doc
          .setFontSize(this.NORMAL_FONT_SIZE)
          .setFont(undefined, "bold")
          .splitTextToSize(alert, maxAlertWidth);

        alertLines.forEach((line) => {
          doc
            .setTextColor("F00")
            .text(
              `${line}`,
              doc.internal.pageSize.width - 2 * this.TAB_SIZE,
              currentPositionY,
              { align: "right", maxWidth: maxAlertWidth, lineHeightFactor: 1.5 }
            );
          currentPositionY += this.NORMAL_FONT_SIZE;
        });
      }
    });

    doc.setTextColor("000").setFont('Helvetica', "normal");

    return (currentPositionY += this.NORMAL_FONT_SIZE + 10);
  }

  // Função para adicionar uma opção do orçamento
  addOption(doc: jsPDF,
    currentPositionY: number,
    option: OrcamentosOpcaoResponse,
    optionTitle: string,
    paymentOptions) {
    const maxPaymentWidth = doc.internal.pageSize.width / 2 - 4 * this.TAB_SIZE;

    currentPositionY = this.addTitle(doc, currentPositionY, optionTitle, true);

    doc
      .setFontSize(this.NORMAL_FONT_SIZE)
      .setTextColor("#000")
      .setFont(undefined, "bold");

    if (doc.internal.pageSize.height - currentPositionY <
      this.NORMAL_FONT_SIZE + 2 * this.TITLE_FONT_SIZE + this.FOOTER_MARGIN) {
      currentPositionY = this.addPageTemplate(doc, undefined);
    }

    doc.text("Descrição", 3 * this.TAB_SIZE, currentPositionY);
    doc.text("Qtde", 300, currentPositionY, {
      align: "right",
    });
    doc.text(
      "VL Unitário",
      363,
      currentPositionY,
      {
        align: "right",
      }
    );
    doc.text(
      "VL Total",
      doc.internal.pageSize.width - 3 * this.TAB_SIZE,
      currentPositionY,
      {
        align: "right",
      }
    );
    currentPositionY += 10;

    option.listaProdutos.forEach((product) => {
      currentPositionY = this.addProduct(doc, currentPositionY, product);
    });

    doc
      .setDrawColor("#a5a5a5")
      .line(
        3 * this.TAB_SIZE,
        currentPositionY - this.SMALL_FONT_SIZE,
        doc.internal.pageSize.width - 3 * this.TAB_SIZE,
        currentPositionY - this.SMALL_FONT_SIZE
      );


    let cashPaymentPaymentLines = 0;
    if (paymentOptions.cashPayment.paymentTitle != "") {
      cashPaymentPaymentLines = this.calculatePaymentLines(
        doc,
        paymentOptions,
        "cashPayment",
        maxPaymentWidth
      );
    }

    let installmentPaymentLines = 0;
    if (paymentOptions.installmentPayment.paymentTitle != "") {
      installmentPaymentLines = this.calculatePaymentLines(
        doc,
        paymentOptions,
        "installmentPayment",
        maxPaymentWidth
      );
    }

    const paymentLines = Math.max(
      cashPaymentPaymentLines,
      installmentPaymentLines
    );

    const paymentHeight = paymentLines * this.SMALL_FONT_SIZE;
    if (
      doc.internal.pageSize.height - currentPositionY <
      paymentHeight + 2 * this.TITLE_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPageTemplate(doc, undefined);
    }

    if (paymentOptions.cashPayment.paymentTitle != "") {
      this.addPaymentInformation(
        doc,
        currentPositionY,
        paymentOptions.cashPayment,
        this.TAB_SIZE * 3,
        paymentOptions.cashPayment.paymentTitle,
        maxPaymentWidth
      );
    }

    if (paymentOptions.installmentPayment.paymentTitle != "") {
      this.addPaymentInformation(
        doc,
        currentPositionY,
        paymentOptions.installmentPayment,
        doc.internal.pageSize.width / 2 + this.TAB_SIZE,
        paymentOptions.installmentPayment.paymentTitle,
        maxPaymentWidth
      );
    }
    currentPositionY += paymentHeight;

    return (currentPositionY += 20);
  }

  //Função para adicionar informações de pagamento
  addPaymentInformation(doc: jsPDF,
    currentPositionY,
    paymentOptions,
    marginX,
    title,
    maxPaymentWidth) {
    const paymentLines = paymentOptions?.paymentLines;

    if (paymentLines) {
      this.drawCheckBox(doc, marginX, currentPositionY, paymentOptions.aprovado);
      let paymentY = currentPositionY + this.CHECKBOX_SIZE - this.CHECKBOX_SIZE * 0.1;

      if (title) {
        const paymentTitleLines = doc
          .setFontSize(this.NORMAL_FONT_SIZE)
          .setFont(undefined, "bold")
          .splitTextToSize(title, maxPaymentWidth);
        paymentTitleLines.forEach((line) => {
          doc.text(line, marginX + this.CHECKBOX_SIZE + this.TAB_SIZE / 2, paymentY);
          paymentY += this.SMALL_FONT_SIZE;
        });
      }

      doc.setFont(undefined, "normal").setFontSize(this.SMALL_FONT_SIZE);

      paymentLines.forEach((line) => {
        const paymentLines = doc.splitTextToSize(line, maxPaymentWidth);
        paymentLines.forEach((line) => {
          doc.text(line, marginX + this.CHECKBOX_SIZE + this.TAB_SIZE / 2, paymentY, {
            maxWidth: maxPaymentWidth,
            lineHeightFactor: 1.5,
          });
          paymentY += this.SMALL_FONT_SIZE;
        });
      });

      currentPositionY = paymentY;
    }

    return currentPositionY;
  }

  // Função para adicionar detalhes de um produto
  addProduct(doc, currentPositionY, product) {
    doc.setFont(undefined, "normal").setFontSize(this.SMALL_FONT_SIZE);

    const maxDescriptionWidth = 260;

    const productDescription = `${product.fabricante}/${product.produto} - ${product.descricao}`;

    const descriptionLines = doc.splitTextToSize(
      productDescription,
      maxDescriptionWidth
    );

    if (
      doc.internal.pageSize.height - currentPositionY <
      descriptionLines.length * this.SMALL_FONT_SIZE + this.FOOTER_MARGIN
    ) {
      currentPositionY = this.addPageTemplate(doc, undefined);
    }

    let descriptionY = currentPositionY;

    doc
      .setDrawColor("#a5a5a5")
      .line(
        3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE,
        doc.internal.pageSize.width - 3 * this.TAB_SIZE,
        descriptionY - this.SMALL_FONT_SIZE
      );

    descriptionLines.forEach((line) => {
      doc.text(line, 3 * this.TAB_SIZE, descriptionY, {
        maxWidth: maxDescriptionWidth,
        lineHeightFactor: 1.5,
      });

      descriptionY += this.SMALL_FONT_SIZE;
    });

    doc.text(`${product.qtde}`, 299, currentPositionY, { align: "right" });

    doc.text(
      `${this.moedaUtils.formatarMoedaSemPrefixo(product.precoVenda)}`,
      362,
      currentPositionY,
      { align: "right" }
    );

    doc.text(
      `${this.moedaUtils.formatarMoedaSemPrefixo(product.totalItem)}`,
      doc.internal.pageSize.width - 3 * this.TAB_SIZE,
      currentPositionY,
      { align: "right" }
    );

    if (descriptionLines.length > 1) {
      currentPositionY += this.SMALL_FONT_SIZE * (descriptionLines.length - 1);
    }

    return (currentPositionY += this.SMALL_FONT_SIZE + 3);
  }

  // Função para adicionar Disclaimer
  addDisclaimer(doc, currentPositionY, disclaimerText) {
    if (
      doc.internal.pageSize.height - currentPositionY <
      this.FOOTER_MARGIN + this.NORMAL_FONT_SIZE * 3
    ) {
      currentPositionY = this.addPageTemplate(doc, undefined);
    }
    const maxDisclaimerWidth = doc.internal.pageSize.width - 4 * this.TAB_SIZE;

    doc
      .setFillColor("#000")
      .rect(
        2 * this.TAB_SIZE,
        currentPositionY,
        doc.internal.pageSize.width - 4 * this.TAB_SIZE,
        1,
        "F"
      );

    currentPositionY += this.NORMAL_FONT_SIZE * 1.2;

    doc
      .setFontSize(this.NORMAL_FONT_SIZE)
      .setFont(undefined, "bold")
      .text("Condições gerais:", 2 * this.TAB_SIZE, currentPositionY);

    currentPositionY += this.NORMAL_FONT_SIZE;

    doc.setFontSize(this.SMALL_FONT_SIZE).setFont(undefined, "normal");

    const disclaimerLines = doc.splitTextToSize(
      disclaimerText,
      maxDisclaimerWidth
    );

    disclaimerLines.forEach((line) => {
      if (doc.internal.pageSize.height - currentPositionY < this.FOOTER_MARGIN) {
        currentPositionY = this.addPageTemplate(doc, undefined);
      }
      doc.text(line, 2 * this.TAB_SIZE, currentPositionY, {
        maxWidth: maxDisclaimerWidth,
        lineHeightFactor: 1.5,
      });

      currentPositionY += this.SMALL_FONT_SIZE;
    });
  }

  // Função para adicionar o rodapé em todas as páginas
  addPageFooter(doc, generateDate) {
    const totalPages = doc.internal.getNumberOfPages();

    doc.setFontSize(this.SMALL_FONT_SIZE).setFont(undefined, "italic");

    const footerDescription = `PDF gerado em ${this.getFormattedFooterDate(
      generateDate
    )}`;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageFooter = `Página ${i} de ${totalPages}`;

      doc
        .text(
          footerDescription,
          doc.internal.pageSize.width / 2 -
          doc.getTextWidth(footerDescription) / 2,
          doc.internal.pageSize.height - this.SMALL_FONT_SIZE * 2
        )
        .text(
          pageFooter,
          doc.internal.pageSize.width - doc.getTextWidth(pageFooter) / 2 - 45,
          doc.internal.pageSize.height - this.SMALL_FONT_SIZE * 2
        )
        .setFillColor("#818181")
        .rect(
          2 * this.TAB_SIZE,
          doc.internal.pageSize.height - this.FOOTER_MARGIN,
          doc.internal.pageSize.width - 4 * this.TAB_SIZE,
          0.5,
          "F"
        );
    }
  }

  // Função para adicionar um titulo
  addTitle(doc, currentPositionY, title, withLine) {
    doc
      .setFontSize(this.TITLE_FONT_SIZE)
      .setFont(undefined, "bold")
      .text(title, 2 * this.TAB_SIZE, currentPositionY);

    doc.setFontSize(this.NORMAL_FONT_SIZE).setFont(undefined, "normal");

    if (withLine) {
      doc
        .setDrawColor("#000")
        .line(
          2 * this.TAB_SIZE,
          currentPositionY + 5,
          doc.internal.pageSize.width - 2 * this.TAB_SIZE,
          currentPositionY + 5
        );
    }

    return (currentPositionY += this.TITLE_FONT_SIZE + 5);
  }

  // Função para adicionar um valor com label
  addLabeledData(doc: jsPDF, currentPositionY: number, data) {
    doc.setFontSize(this.NORMAL_FONT_SIZE);

    data.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      const labelWidth = doc
        .text(label, 2 * this.TAB_SIZE, currentPositionY)
        .getTextWidth(label);

      doc.setFont(undefined, "normal");
      doc.text(`${value}`, 2 * this.TAB_SIZE + labelWidth + 2, currentPositionY);
      currentPositionY += this.NORMAL_FONT_SIZE;
    });

    return currentPositionY;
  }

  // Função para calcular linhas das opções de pagamento
  calculatePaymentLines(doc: jsPDF, paymentOptions, option, maxWidth: number) {
    let paymentLines = 0;

    paymentOptions?.[option]?.paymentLines?.forEach((line) => {
      const lines = doc
        .setFontSize(this.SMALL_FONT_SIZE)
        .splitTextToSize(line, maxWidth).length;
      paymentLines += lines;
    });

    if (paymentOptions?.[option]?.paymentTitle) {
      const paymentTitleLines = doc
        .setFontSize(this.NORMAL_FONT_SIZE)
        .setFont(undefined, "bold")
        .splitTextToSize(paymentOptions?.[option]?.paymentTitle, maxWidth);

      paymentLines += paymentTitleLines.length;
    }

    return paymentLines;
  }

  // Função para desenhar checkbox
  drawCheckBox(doc: jsPDF, x: number, y: number, aprovado: boolean) {
    doc.setDrawColor("#000000");
    if (aprovado)
      doc.rect(x, y, this.CHECKBOX_SIZE, this.CHECKBOX_SIZE, "FD");
    else
      doc.rect(x, y, this.CHECKBOX_SIZE, this.CHECKBOX_SIZE, "S");
  }

  // Função para obter a data formatada impressa no footer
  getFormattedFooterDate(date: Date): string {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .format(date)
      .replace(", ", " às ");
  }

  // Função para formatar data
  getFormattedDate(date: Date): string {
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  }

  // Função para formatar data no nome do arquivo
  getFormattedDateFileName(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}`;
  }

  verificarFormasPagtos() {
    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.forEach(opcao => {
      let pagtosHabilitados = opcao.formaPagto.filter(x => x.habilitado);
      if (pagtosHabilitados.length == 1) {
        opcao.pagtoSelecionado = pagtosHabilitados[0];
      }
    });
  }

  verificarOpcaoAprovada() {
    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.forEach(f => {
      f.formaPagto.forEach(p => {
        if (p.aprovado) {
          f.aprovado = true;
        }
      })
    })
  }

  excluirOrcamento() {

    this.sweetalertService.dialogo("", "Confirma a exclusão do orçamento?").subscribe(result => {
      if (!result) return;
      this.mensagemComponente.carregando = true;
      this.orcamentoService.excluirOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto).toPromise().then((r) => {
        this.mensagemComponente.carregando = false;
        if (!r.Sucesso) {
          this.alertaService.mostrarMensagem(r.Mensagem);
          return;
        }

        this.sweetalertService.sucesso("Orçamento excluído com sucesso!");
        this.router.navigate(['orcamentos/listar/orcamentos']);
      }).catch((e) => {
        this.mensagemComponente.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      });

    });
  }

  anularOrcamentoAprovado() {
    this.sweetalertService.dialogo("", "Deseja realmente anular este orçamento?").subscribe(result => {
      if (!result) return;
      this.mensagemComponente.carregando = true;

      this.orcamentoService.anularOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto).toPromise().then((r) => {
        this.mensagemComponente.carregando = false;
        if (!r.Sucesso) {
          this.alertaService.mostrarMensagem(r.Mensagem);
          return;
        }

        this.sweetalertService.sucesso("Orçamento anulado com sucesso!");
        this.router.navigate(['orcamentos/listar/orcamentos']);
      }).catch((e) => {
        this.mensagemComponente.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      });
    });
  }

  verificarDisponibilidadeOrcamento() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.status == this.constantes.STATUS_ORCAMENTO_COTACAO_EXCLUIDO) {
      this.alertaService.mostrarMensagem(`Orçamento ${this.novoOrcamentoService.orcamentoCotacaoDto.id} foi excluído!`);
      this.router.navigate(['orcamentos/listar/orcamentos']);
    }
  }

  ngOnDestroy() {
    if (this.router.url.indexOf('orcamentos/listar/orcamentos') == -1 &&
      this.router.url.indexOf('orcamentos/listar/pendentes') == -1 &&
      this.router.url.indexOf('orcamentos/listar/pedidos') == -1) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
  }
}
