import { AutenticacaoService } from './../../../service/autenticacao/autenticacao.service';
import { PublicoService } from './../../../service/publico/publico.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { PublicoCadastroClienteComponent } from '../cadastro-cliente/cadastro-cliente.component';
import { PublicoHeaderComponent } from '../header/header.component';

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
  ) {
    super(telaDesktopService);
  }

  public constantes: Constantes = new Constantes();
  sub: Subscription;
  carregando: boolean = false;
  orcamento: OrcamentoCotacaoDto;
  moedaUtils: MoedaUtils = new MoedaUtils();
  dataUtils: DataUtils = new DataUtils();
  stringUtils = StringUtils;
  @ViewChild("mensagemComponente", { static: false }) mensagemComponente: MensageriaComponent;
  @ViewChild(PublicoCadastroClienteComponent) child;
  display: boolean = false;
  validado: boolean = false;
  desabiltarBotoes: boolean;

  @ViewChild("publicHeader", { static: false }) publicHeader: PublicoHeaderComponent;

  ngOnInit(): void {
    
    this.sub = this.activatedRoute.params.subscribe((param: any) => {
      this.buscarOrcamentoPorGuid(param);
    });
  }

  ngAfterViewInit(): void {
    this.sub = this.activatedRoute.params.subscribe((param: any) => { this.buscarOrcamentoPorGuid(param); });
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
  buscarOrcamentoPorGuid(param) {
    
    if (param.guid.length >= 32) {
      this.publicoService.buscarOrcamentoPorGuid(param.guid).toPromise().then((r) => {
        if (r != null) {
          this.validado = true;
          this.orcamento = r;
          this.publicHeader.imagemLogotipo = 'assets/layout/images/' + this.orcamento.lojaViewModel.imagemLogotipo;

          this.mensagemComponente.permiteEnviarMensagem = true;


          if (r.status == 3) {
            this.desabiltarBotoes = true;
            this.mensagemComponente.permiteEnviarMensagem = false;
          }

          this.mensagemComponente.idOrcamentoCotacao = r.mensageria.idOrcamentoCotacao;
          this.mensagemComponente.idUsuarioRemetente = r.mensageria.idUsuarioRemetente.toString();
          this.mensagemComponente.idTipoUsuarioContextoRemetente = r.mensageria.idTipoUsuarioContextoRemetente.toString();
          this.mensagemComponente.idUsuarioDestinatario = r.mensageria.idUsuarioDestinatario.toString();
          this.mensagemComponente.idTipoUsuarioContextoDestinatario = r.mensageria.idTipoUsuarioContextoDestinatario.toString();
          this.mensagemComponente.obterListaMensagem(this.orcamento.id);

          this.autenticacaoService.setarToken(r.token);
        } else {
          this.sweetalertService.aviso("Orçamento não está mais disponível para visualização ou link inválido");
        }
      });
    }
  }

  salvar() {
    this.child.salvar();
  }

  aprovar(opcao) {
    // if (!this.opcaoPagto) {
    // }
    //   this.sweetalertService.confirmarAprovacao("Deseja aprovar essa opção?", "").subscribe(result => {
    // });
  }



  activeState: boolean[] = [false, false, false];
  toggle(index: number) {
    if (this.activeState.toString().indexOf("true") == -1) return;

    for (let i = 0; i < this.activeState.length; i++) {
      if (i == index) this.activeState[i] = true;
      else this.activeState[i] = false;
    }
  }

  showDialog() {
    if (this.orcamento.status == 2 || this.orcamento.status == 3) { //APROVADO ou CANCELADO 
      this.alertaService.mostrarMensagem("Não é possível aprovar, orçamentos aprovados ou cancelados!");
      return;
    }

    if (this.orcamento.validade < new Date()) {
      this.alertaService.mostrarMensagem("Não é possível aprovar, orçamentos com validade expirada!");
      return;
    }

    this.display = true;
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