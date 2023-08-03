import { AutenticacaoService } from './../../../service/autenticacao/autenticacao.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MensageriaComponent } from 'src/app/views/mensageria/mensageria.component';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { Constantes } from 'src/app/utilities/constantes';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { PublicoHeaderComponent } from '../header/header.component';
import { PublicoService } from 'src/app/service/publico/publico.service';
import { AprovacaoPublicoService } from '../aprovacao-publico.service';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-opcao-dto';
import { ProdutoCatalogoService } from '../../../service/produtos-catalogo/produto.catalogo.service'
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { Title } from '@angular/platform-browser';
import { lojaEstilo } from 'src/app/dto/lojas/lojaEstilo';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';

@Component({
  selector: 'app-orcamento',
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.scss']
})
export class PublicoOrcamentoComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  constructor(
    telaDesktopService: TelaDesktopService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly publicoService: PublicoService,
    private readonly alertaService: AlertaService,
    private readonly sweetalertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly aprovacaoPublicoService: AprovacaoPublicoService,
    private readonly produtoCatalogoService: ProdutoCatalogoService,
    private readonly lojaService: LojasService,
    private readonly orcamentoService: OrcamentosService
  ) {
    super(telaDesktopService);
  }

  constantes: Constantes = new Constantes();
  sub: Subscription;
  carregando: boolean = false;
  orcamento: OrcamentoCotacaoDto;
  moedaUtils: MoedaUtils = new MoedaUtils();
  dataUtils: DataUtils = new DataUtils();
  stringUtils = StringUtils;

  display: boolean = false;
  validado: boolean = false;
  desabiltarBotoes: boolean;
  opcaoPagtoSelecionada: FormaPagtoCriacao;
  imgUrl: string;
  _lojaEstilo: lojaEstilo = new lojaEstilo();
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  private titleService: Title
  esconderBotaoAprovacao: boolean;
  paramGuid: any;
  activeState: boolean[] = [false, false, false];
  @ViewChild("publicHeader", { static: false }) publicHeader: PublicoHeaderComponent;
  @ViewChild("mensagemComponente", { static: true }) mensagemComponente: MensageriaComponent;

  ngOnInit(): void {
    // this.mensagemComponente.carregando = true;
    this.imgUrl = this.produtoCatalogoService.imgUrl;
    this.esconderBotaoAprovacao = false;
    this.carregando = true;
    this.paramGuid = this.activatedRoute.snapshot.params.guid;

    let promise: any = [this.buscarOrcamento()];
    Promise.all(promise).then((r: any) => {
      this.setarOrcamento(r[0]);
      this.autenticacaoService.setarToken(r[0].token);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
      this.verificarImagens();
      this.promise2();
    });

    // this.sub = this.activatedRoute.params.subscribe((param: any) => {
    //   this.buscarOrcamentoPorGuid(param);
    // });
  }

  promise2() {
    this.carregando = true;
    this.setarMensageria();

    let promises: any = [
      this.buscarEstilo(),
      this.mensagemComponente.buscarListaMensagem(this.orcamento.id),
      this.buscarParametro(this.constantes.ModuloOrcamentoCotacao_Disclaimer_MedianteConfirmacaoEstoque),
      this.buscarParametro(this.constantes.ModuloOrcamentoCotacao_Disclaimer_Frete)];

    Promise.all(promises).then((r: any) => {
      this.setarLojaEstilo(r[0]);
      this.mensagemComponente.setarListaMensagem(this.orcamento.id, r[1]);
      this.setarMensagemEstoque(r[2]);
      this.setarMensagemFrete(r[3]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
    });
  }

  buscarOrcamento(): Promise<OrcamentoCotacaoDto> {
    return this.publicoService.buscarOrcamentoPorGuid(this.paramGuid).toPromise();
  }

  buscarEstilo(): Promise<lojaEstilo> {
    return this.lojaService.buscarLojaEstilo(this.orcamento.loja).toPromise();
  }

  buscarParametro(param: number): Promise<any> {
    return this.orcamentoService
      .buscarParametros(param, this.orcamento.loja, "publico")
      .toPromise();
  }

  setarOrcamento(r: OrcamentoCotacaoDto) {
    if (r != null) {
      this.validado = true;
      this.orcamento = r;

      if (r.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
        let opcaoAprovado: OrcamentoOpcaoDto;
        this.orcamento.listaOpcoes.forEach(e => {
          let pagtoAprovado = e.formaPagto.filter(x => x.aprovado)[0];
          if (!!pagtoAprovado) {
            opcaoAprovado = new OrcamentoOpcaoDto();
            opcaoAprovado = this.orcamento.listaOpcoes.filter(y => y.id == pagtoAprovado.idOpcao)[0];
            opcaoAprovado.aprovado = true;
          }
        });
      }
      else {
        this.aprovacaoPublicoService.orcamento = r;
        this.aprovacaoPublicoService.paramGuid = this.paramGuid;
        this.verificarFormasPagtos();
      }

      let dataAtual = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      let validade = this.orcamento.validade;
      let dataValidade = new Date(new Date(validade).getFullYear(), new Date(validade).getMonth(), new Date(validade).getDate());

      if (this.orcamento.status == 1 && dataValidade < dataAtual) {
        this.orcamento.statusDescricao = "Expirado";
      }

      if (this.orcamento.status == 2 || this.orcamento.status == 3 || this.orcamento.status == 1 && dataValidade < dataAtual) {
        this.esconderBotaoAprovacao = true;
      }

      // this.lojaService.buscarLojaEstilo(this.orcamento.loja).toPromise().then((r) => {
      //   if (!!r) {
      //     this.publicHeader.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;
      //     this.publicHeader.corCabecalho = r.corCabecalho + " !important";
      //     this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
      //   }
      // });

      // debugger;
      // if (this.mensagemComponente != undefined) {
      //   this.mensagemComponente.permiteEnviarMensagem = true;

      //   if (r.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
      //     this.desabiltarBotoes = true;
      //     // this.mensagemComponente.permiteEnviarMensagem = false;
      //   }


      //   this.mensagemComponente.idOrcamentoCotacao = r.mensageria.idOrcamentoCotacao;
      //   this.mensagemComponente.idUsuarioRemetente = r.mensageria.idUsuarioRemetente.toString();
      //   this.mensagemComponente.idTipoUsuarioContextoRemetente = r.mensageria.idTipoUsuarioContextoRemetente.toString();
      //   this.mensagemComponente.idUsuarioDestinatario = r.mensageria.idUsuarioDestinatario.toString();
      //   this.mensagemComponente.idTipoUsuarioContextoDestinatario = r.mensageria.idTipoUsuarioContextoDestinatario.toString();
      //   this.mensagemComponente.rotaPublica = true;
      //   this.mensagemComponente.guid = this.paramGuid;
      //   this.mensagemComponente.obterListaMensagem(this.orcamento.id);
      // }

      // this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_MedianteConfirmacaoEstoque, this.orcamento.loja, "publico")
      //   .toPromise()
      //   .then((r) => {
      //     let valor = r[0].Valor;
      //     let div = document.getElementById("estoque");
      //     if (valor.indexOf("style=") > -1) {
      //       let parser = new DOMParser();
      //       let html = parser.parseFromString(valor, 'text/html');
      //       let parag = html.getElementsByTagName("p");
      //       div.appendChild(parag[0]);
      //     }
      //     else {
      //       div.innerHTML = r[0].Valor;
      //       div.classList.add("infoEstoque");
      //     }
      //   });

      // this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_Frete, this.orcamento.loja, "publico")
      //   .toPromise()
      //   .then((r) => {
      //     let valor = r[0].Valor;
      //     let div = document.getElementById("frete");
      //     while (div.firstChild) {
      //       div.removeChild(div.firstChild);
      //     };
      //     if (valor.indexOf("style=") > -1) {
      //       let parser = new DOMParser();
      //       let html = parser.parseFromString(valor, 'text/html');
      //       let parag = html.getElementsByTagName("p");
      //       div.appendChild(parag[0]);
      //     }
      //     else {
      //       div.innerHTML = r[0].Valor;
      //       div.classList.add("infoEstoque");
      //     }
      //   });

      // this.verificarImagens();
      // this.autenticacaoService.setarToken(r.token);
      // this.carregando = false;
    } else {
      this.carregando = false;
      this.sweetalertService.aviso("Orçamento não está mais disponível para visualização ou link inválido");
    }
  }

  setarLojaEstilo(r: lojaEstilo) {
    if (!!r) {
      this.publicHeader.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;
      this.publicHeader.corCabecalho = r.corCabecalho + " !important";
      this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
    }
  }

  setarMensageria() {

    this.mensagemComponente.permiteEnviarMensagem = true;

    if (this.orcamento.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
      this.desabiltarBotoes = true;
    }
    this.mensagemComponente.idOrcamentoCotacao = this.orcamento.mensageria.idOrcamentoCotacao;
    this.mensagemComponente.idUsuarioRemetente = this.orcamento.mensageria.idUsuarioRemetente.toString();
    this.mensagemComponente.idTipoUsuarioContextoRemetente = this.orcamento.mensageria.idTipoUsuarioContextoRemetente.toString();
    this.mensagemComponente.idUsuarioDestinatario = this.orcamento.mensageria.idUsuarioDestinatario.toString();
    this.mensagemComponente.idTipoUsuarioContextoDestinatario = this.orcamento.mensageria.idTipoUsuarioContextoDestinatario.toString();
    this.mensagemComponente.rotaPublica = true;
    this.mensagemComponente.guid = this.paramGuid;
  }

  setarMensagemEstoque(r: any) {
    let valor = r[0].Valor;
    let div = document.getElementById("estoque");
    if (valor.indexOf("style=") > -1) {
      let parser = new DOMParser();
      let html = parser.parseFromString(valor, 'text/html');
      let parag = html.getElementsByTagName("p");
      div.appendChild(parag[0]);
    }
    else {
      div.innerHTML = r[0].Valor;
      div.classList.add("infoEstoque");
    }
  }

  setarMensagemFrete(r: any) {
    let valor = r[0].Valor;
    let div = document.getElementById("frete");
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    };
    if (valor.indexOf("style=") > -1) {
      let parser = new DOMParser();
      let html = parser.parseFromString(valor, 'text/html');
      let parag = html.getElementsByTagName("p");
      div.appendChild(parag[0]);
    }
    else {
      div.innerHTML = r[0].Valor;
      div.classList.add("infoEstoque");
    }
  }

  ngAfterViewInit(): void {
    this.sub = this.activatedRoute.params.subscribe((param: any) => {
      //  this.buscarOrcamentoPorGuid(param); 
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  retornarSimOuNao(data: any) {

    if (data == true) {
      return "Sim";
    } else {
      return "Não";
    }
  }

  retornarEntregaImediata(data: any) {
    if (data == 0) return;
    if (data == 2) return "Sim";
    if (data == 1) return "Não";
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

  // buscarOrcamentoPorGuid(param) {

  //   if (param.guid.length >= 32) {
  //     this.publicoService.buscarOrcamentoPorGuid(param.guid).toPromise().then((r) => {

  //       if (r != null) {
  //         this.validado = true;
  //         this.orcamento = r;

  //         if (r.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
  //           let opcaoAprovado: OrcamentoOpcaoDto;
  //           this.orcamento.listaOpcoes.forEach(e => {
  //             let pagtoAprovado = e.formaPagto.filter(x => x.aprovado)[0];
  //             if (!!pagtoAprovado) {
  //               opcaoAprovado = new OrcamentoOpcaoDto();
  //               opcaoAprovado = this.orcamento.listaOpcoes.filter(y => y.id == pagtoAprovado.idOpcao)[0];
  //               opcaoAprovado.aprovado = true;
  //             }
  //           });
  //         }
  //         else {
  //           this.aprovacaoPublicoService.orcamento = r;
  //           this.aprovacaoPublicoService.paramGuid = param.guid;
  //           this.paramGuid = param.guid;
  //           this.verificarFormasPagtos();
  //         }

  //         let dataAtual = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  //         let validade = this.orcamento.validade;
  //         let dataValidade = new Date(new Date(validade).getFullYear(), new Date(validade).getMonth(), new Date(validade).getDate());

  //         if (this.orcamento.status == 1 && dataValidade < dataAtual) {
  //           this.orcamento.statusDescricao = "Expirado";
  //         }

  //         if (this.orcamento.status == 2 || this.orcamento.status == 3 || this.orcamento.status == 1 && dataValidade < dataAtual) {
  //           this.esconderBotaoAprovacao = true;
  //         }

  //         this.lojaService.buscarLojaEstilo(this.orcamento.loja).toPromise().then((r) => {
  //           if (!!r) {
  //             this.publicHeader.imagemLogotipo = 'assets/layout/images/' + r.imagemLogotipo;
  //             this.publicHeader.corCabecalho = r.corCabecalho + " !important";
  //             this.favIcon.href = 'assets/layout/images/' + (r.imagemLogotipo.includes('Unis') ? "favicon-unis.ico" : "favicon-bonshop.ico");
  //           }
  //         });

  //         if (this.mensagemComponente != undefined) {
  //           this.mensagemComponente.permiteEnviarMensagem = true;

  //           if (r.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
  //             this.desabiltarBotoes = true;
  //             // this.mensagemComponente.permiteEnviarMensagem = false;
  //           }


  //           this.mensagemComponente.idOrcamentoCotacao = r.mensageria.idOrcamentoCotacao;
  //           this.mensagemComponente.idUsuarioRemetente = r.mensageria.idUsuarioRemetente.toString();
  //           this.mensagemComponente.idTipoUsuarioContextoRemetente = r.mensageria.idTipoUsuarioContextoRemetente.toString();
  //           this.mensagemComponente.idUsuarioDestinatario = r.mensageria.idUsuarioDestinatario.toString();
  //           this.mensagemComponente.idTipoUsuarioContextoDestinatario = r.mensageria.idTipoUsuarioContextoDestinatario.toString();
  //           this.mensagemComponente.rotaPublica = true;
  //           this.mensagemComponente.guid = param.guid;
  //           this.mensagemComponente.obterListaMensagem(this.orcamento.id);
  //         }

  //         this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_MedianteConfirmacaoEstoque, this.orcamento.loja, "publico")
  //           .toPromise()
  //           .then((r) => {
  //             let valor = r[0].Valor;
  //             let div = document.getElementById("estoque");
  //             if (valor.indexOf("style=") > -1) {
  //               let parser = new DOMParser();
  //               let html = parser.parseFromString(valor, 'text/html');
  //               let parag = html.getElementsByTagName("p");
  //               div.appendChild(parag[0]);
  //             }
  //             else {
  //               div.innerHTML = r[0].Valor;
  //               div.classList.add("infoEstoque");
  //             }
  //           });

  //         this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_Disclaimer_Frete, this.orcamento.loja, "publico")
  //           .toPromise()
  //           .then((r) => {
  //             let valor = r[0].Valor;
  //             let div = document.getElementById("frete");
  //             while (div.firstChild) {
  //               div.removeChild(div.firstChild);
  //             };
  //             if (valor.indexOf("style=") > -1) {
  //               let parser = new DOMParser();
  //               let html = parser.parseFromString(valor, 'text/html');
  //               let parag = html.getElementsByTagName("p");
  //               div.appendChild(parag[0]);
  //             }
  //             else {
  //               div.innerHTML = r[0].Valor;
  //               div.classList.add("infoEstoque");
  //             }
  //           });

  //         this.verificarImagens();
  //         this.autenticacaoService.setarToken(r.token);
  //         this.carregando = false;
  //       } else {
  //         this.carregando = false;
  //         this.sweetalertService.aviso("Orçamento não está mais disponível para visualização ou link inválido");
  //       }
  //     }).catch((r) => this.alertaService.mostrarErroInternet(r));
  //   }
  // }

  verificarImagens() {
    for (let i = 0; i < this.orcamento.listaOpcoes.length; i++) {
      this.orcamento.listaOpcoes[i].existeImagemProduto = false;
      for (let y = 0; y < this.orcamento.listaOpcoes[i].listaProdutos.length; y++) {
        if (!!this.orcamento.listaOpcoes[i].listaProdutos[y].urlImagem) {
          this.orcamento.listaOpcoes[i].existeImagemProduto = true;
          break;
        }
      }
    }
  }

  verificarFormasPagtos() {
    this.orcamento.listaOpcoes.forEach(opcao => {
      if (opcao.formaPagto.length == 1) opcao.pagtoSelecionado = opcao.formaPagto[0];
    })
  }

  aprovar(opcao: OrcamentoOpcaoDto) {

    if (this.orcamento.status == this.constantes.STATUS_ORCAMENTO_COTACAO_APROVADO) {
      this.sweetalertService.aviso("Esse orçamento já foi aprovado!");
      return;
    }
    if (this.orcamento.status == this.constantes.STATUS_ORCAMENTO_COTACAO_CANCELADO) {
      this.sweetalertService.aviso("Esse orçamento não pode ser aprovado!");
      return;
    }

    //Não precisamos validar isso, pois essa validação esta sendo feita ao buscar o orçamento
    // estou deixando comentado para o caso de precisar mudar o fluxo de verificação dessa regra
    // if(!this.verificarStatusEExpiracao()) return;
    if (!opcao.pagtoSelecionado) {
      this.alertaService.mostrarMensagem("Favor selecionar uma forma de pagamento!");
      return;
    }

    //aprovar forma de pagto
    opcao.formaPagto.forEach(x => {
      if (x.id == opcao.pagtoSelecionado.id) x.aprovado = true;
    });

    this.sweetalertService.dialogo("Deseja realmente aprovar essa opção?", "").subscribe(result => {
      if (result) {
        this.router.navigate([`publico/cadastro-cliente/${this.paramGuid}`], {
          queryParams: {
            idOpcao: opcao.id,
            idFormaPagto: opcao.pagtoSelecionado.id
          }
        });
      }
    });
    // this.router.navigate([`publico/cadastro-cliente/${this.paramGuid}`]);
  }

  verificarStatusEExpiracao(): boolean {
    if (this.orcamento.status == 2 || this.orcamento.status == 3) { //APROVADO ou CANCELADO 
      this.alertaService.mostrarMensagem("Não é possível aprovar, orçamentos aprovados ou cancelados!");
      return false;
    }
    if (this.orcamento.validade < new Date()) {
      this.alertaService.mostrarMensagem("Não é possível aprovar, orçamentos com validade expirada!");
      return false;
    }
    if (!this.opcaoPagtoSelecionada) {
      this.alertaService.mostrarMensagem("Escolha uma forma de pagamento!");
      return false;
    }

    return true;
  }

  toggle(index: number) {
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  formatarFormaPagamento(orcamento, opcao: OrcamentosOpcaoResponse, fPagto: FormaPagtoCriacao) {

    let texto: string = "";

    opcao.formaPagto.some((fp) => {

      let pagto = orcamento.listaFormasPagto.filter(f => f?.idTipoPagamento == fPagto?.tipo_parcelamento)[0];

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
        let valorTotalAvista = this.moedaUtils
          .formatarMoedaComPrefixo(opcao?.listaProdutos
            .reduce((sum, current) => sum + this.moedaUtils
              .formatarDecimal((current?.precoListaBase * (1 - current?.descDado / 100)) * current?.qtde), 0));
        let meio = pagto?.meios?.filter(m => m?.id.toString() == fPagto?.op_av_forma_pagto)[0]?.descricao;
        texto = pagto?.tipoPagamentoDescricao + " em " + meio + " " + valorTotalAvista;

        return true;
      }

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
        texto = pagto?.tipoPagamentoDescricao + " em " + fp?.c_pc_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp?.c_pc_valor);

        return true;
      }

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
        let meioEntrada = pagto.meios.filter(m => m.id.toString() == fPagto.op_pce_entrada_forma_pagto)[0]?.descricao;
        let meioPrestacao = pagto.meios.filter(m => m.id.toString() == fPagto.op_pce_prestacao_forma_pagto)[0]?.descricao;
        texto = pagto.tipoPagamentoDescricao + ":<br>Entrada: " + meioEntrada + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.o_pce_entrada_valor) +
          " <br> Demais Prestações: " + meioPrestacao + " em " + fPagto.c_pce_prestacao_qtde + " X de "
          + this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pce_prestacao_valor) + "<br> Período entre Parcelas: " +
          fPagto.c_pce_prestacao_periodo + " dias";

        return true;
      }

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
        let meioPrimPrest = pagto.meios.filter(m => m.id.toString() == fPagto.op_pse_prim_prest_forma_pagto)[0]?.descricao;
        let meioPrestacao = pagto.meios.filter(m => m.id.toString() == fPagto.op_pse_demais_prest_forma_pagto)[0]?.descricao;
        texto = pagto.tipoPagamentoDescricao + ":<br>1º Prestação: " + meioPrestacao + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_prim_prest_valor) + " vencendo após " + fPagto.c_pse_prim_prest_apos + " dias" +
          "<br>Demais Prestações: " + meioPrestacao + " em " + fPagto.c_pse_demais_prest_qtde + " X de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pse_demais_prest_valor) + "<br>Período entre Parcelas: " +
          fPagto.c_pse_demais_prest_periodo + " dias";

        return true;
      }

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
        let meio = pagto.meios.filter(m => m.id.toString() == fPagto.op_pu_forma_pagto)[0]?.descricao;
        texto = pagto.tipoPagamentoDescricao + " em " + meio + " no valor de " +
          this.moedaUtils.formatarMoedaComPrefixo(fPagto.c_pu_valor) + " vencendo após " + fPagto.c_pu_vencto_apos + " dias ";
        return true;
      }

      if (pagto?.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {

        texto = pagto?.tipoPagamentoDescricao + " em " + fp?.c_pc_maquineta_qtde.toString() + " X de " + this.moedaUtils.formatarMoedaComPrefixo(fp?.c_pc_maquineta_valor);
        return true;
      }

    });

    return texto;
  }

}
