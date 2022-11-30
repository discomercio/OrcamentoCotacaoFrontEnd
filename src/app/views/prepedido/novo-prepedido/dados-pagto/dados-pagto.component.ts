
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { PassoPrepedidoBase } from '../passo-prepedido-base';
import { EnumFormaPagto } from './enum-forma-pagto';
import { EnumTipoPagto } from './tipo-forma-pagto';
import { RecalcularComCoeficiente } from './recalcularComCoeficiente';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { FormaPagtoDto } from 'src/app/dto/prepedido/FormaPagto/FormaPagtoDto';
import { CoeficienteDto } from 'src/app/dto/prepedido/Produto/CoeficienteDto';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Component({
  selector: 'app-dados-pagto',
  templateUrl: './dados-pagto.component.html',
  styleUrls: ['./dados-pagto.component.scss']
})
export class DadosPagtoComponent extends PassoPrepedidoBase implements OnInit {

  public enumFormaPagto: EnumFormaPagto;
  //para usar o enum 
  public EnumFormaPagto = EnumFormaPagto;


  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    router: Router,
    novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly alertaService: AlertaService,
    public readonly dialog: MatDialog,
    telaDesktopService: TelaDesktopService,
    public readonly prepedidoBuscarService: PrepedidoBuscarService
  ) {
    super(telaDesktopService, router, novoPrepedidoDadosService);
  }

  mascaraNum() {
    return [/\d/, /\d/];
  }

  ngOnInit() {

    this.buscarQtdeParcCartaoVisa();
    this.verificarEmProcesso();
    this.buscarFormaPagto();
    // this.buscarCoeficiente(null);
    // this.buscarNovoCoeficiente();
    setTimeout(() => {
      this.montaFormaPagtoExistente();
    }, 300);

  }

  voltar() {
    this.location.back();
  }

  continuar() {
    this.router.navigate(["../confirmar-prepedido"], { relativeTo: this.activatedRoute });
  }

  public podeContinuar(mostrarMsg: boolean): boolean {
    if (this.enumFormaPagto == 0) {

      //necessário verificar se os dados de pagto estão corretamente preenchido
      if (mostrarMsg) {
        this.alertaService.mostrarMensagem("Favor escolher uma forma de pagamento!");
      }
    }
    else if (!this.validarFormaPagto(mostrarMsg)) {
      return false;
    }
    else {
      //passar valores para o dto
      this.atribuirFormaPagtoParaDto();
      return true;
    }
    return false;
  }

  public opcaoPagtoAvista: string;
  public opcaoPagtoParcUnica: string;
  public opcaoPagtoParcComEntrada: string;
  public opcaoPagtoParcCartaoInternet: string;
  public opcaoPagtoParcCartaoMaquineta: string;
  public meioPagtoEntrada: number;
  public meioPagtoAVista: number;
  public meioPagtoEntradaPrest: number;
  public diasVenc: number;//pagto com entrada, dias para vencimento
  public meioPagtoParcUnica: number;
  public diasVencParcUnica: number;
  qtde: number;//qtde de parcelas
  valor: number;//valor da parcela

  lstNovoCoeficiente = new RecalcularComCoeficiente(this.prepedidoBuscarService, this.novoPrepedidoDadosService,
    this.alertaService);

  atribuirFormaPagtoParaDto() {
    // this.prePedidoDto.FormaPagtoCriacao = new FormaPagtoCriacaoDto(); 
    this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento = this.enumFormaPagto;
    if (this.enumFormaPagto == 1) {
      //A vista      
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      if (!!this.meioPagtoAVista)
        this.prePedidoDto.FormaPagtoCriacao.Op_av_forma_pagto = this.meioPagtoAVista.toString();//meio de pagamento
      this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas = 0;
    }
    if (this.enumFormaPagto == 2) {
      //ParcCartaoInternet
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      this.prePedidoDto.FormaPagtoCriacao.C_pc_qtde = this.qtde; //passar a qtde de parcelas para uma variávl "qtdeParcelas"
      this.prePedidoDto.FormaPagtoCriacao.C_pc_valor = this.valor;
      this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas = this.qtde;
    }
    if (this.enumFormaPagto == 3) {
      //ParcComEnt
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      this.prePedidoDto.FormaPagtoCriacao.Op_pce_entrada_forma_pagto = this.meioPagtoEntrada.toString();//meio de pagamento
      if (this.meioPagtoEntradaPrest)
        this.prePedidoDto.FormaPagtoCriacao.Op_pce_prestacao_forma_pagto = this.meioPagtoEntradaPrest.toString();//meio de pagamento
      this.prePedidoDto.FormaPagtoCriacao.C_pce_entrada_valor = this.vlEntrada;
      this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_qtde = this.qtde;
      this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_valor = this.valor;
      this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_periodo = this.diasVenc != null ?
        parseInt(this.diasVenc.toString().replace("_", "")) : this.diasVenc;
      this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas = this.qtde + 1;//c_pce_prestacao_qtde + 1
    }
    //NÃO ESTA SENDO USADO
    if (this.enumFormaPagto == 4) {
      //ParcSemEnt
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      this.prePedidoDto.FormaPagtoCriacao.Op_pse_prim_prest_forma_pagto = "";//meio de pagamento
      this.prePedidoDto.FormaPagtoCriacao.Op_pse_demais_prest_forma_pagto = "";//meio de pagamento
      this.prePedidoDto.FormaPagtoCriacao.C_pse_prim_prest_valor = 0;
      this.prePedidoDto.FormaPagtoCriacao.C_pse_prim_prest_apos = 0;
      this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
      this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_valor = 0;
      this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_periodo = 0;
      this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
    }
    if (this.enumFormaPagto == 5) {
      //ParcUnica
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      if (!!this.meioPagtoParcUnica)
        this.prePedidoDto.FormaPagtoCriacao.Op_pu_forma_pagto = this.meioPagtoParcUnica.toString();//meio de pagamento
      this.prePedidoDto.FormaPagtoCriacao.C_pu_valor = this.valor;
      this.prePedidoDto.FormaPagtoCriacao.C_pu_vencto_apos = this.diasVencParcUnica != null ?
        parseInt(this.diasVencParcUnica.toString().replace("_", "")) : this.diasVencParcUnica;
      this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas = 1;
    }
    if (this.enumFormaPagto == 6) {
      //ParcCartaoMaquineta
      this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
      this.prePedidoDto.FormaPagtoCriacao.C_pc_maquineta_qtde = this.qtde;
      this.prePedidoDto.FormaPagtoCriacao.C_pc_maquineta_valor = this.valor;
      this.prePedidoDto.FormaPagtoCriacao.C_pc_maquineta_qtde = this.qtde;
      this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas = this.qtde;
    }

  }

  enterFormaPagto(event: Event) {
    event.cancelBubble = true;
    event.preventDefault();
    this.prePedidoDto.FormaPagtoCriacao.C_forma_pagto = "" + "\r\n";
  }

  validarFormaPagto(mostrarMsg: boolean): boolean {

    let retorno = true;
    // this.verificaParcelamento();
    if (this.validarOpcoesPagto(mostrarMsg)) {
      if (this.enumFormaPagto == 1 && !this.meioPagtoAVista)//avista
      {
        if (mostrarMsg) {
          this.alertaService.mostrarMensagem("Favor selecionar o meio de pagamento á vista");
          retorno = false;
        }
      }
      if (this.enumFormaPagto == 2 && (!this.qtde || !this.valor))//ParcCartaoInternet
      {
        if (mostrarMsg) {
          this.alertaService.mostrarMensagem("Favor selecionar corretamente o meio de pagamento " +
            "para Parcelado no Cartão (Internet).");
          retorno = false;
        }
      }
      if (this.enumFormaPagto == 3) {
        if (this.meioPagtoEntrada && this.meioPagtoEntradaPrest)
        //ParcComEnt
        {
          if (!!this.vlEntrada && this.vlEntrada == 0.00) {
            this.alertaService.mostrarMensagem("Favor preencher o valor de entrada!");
            retorno = false;
          }
          if (!this.diasVenc) {
            if (mostrarMsg) {
              this.alertaService.mostrarMensagem("Favor informar corretamente os dados para pagamento Parcelado com Entrada!");
              retorno = false;
            }
          }
        }
        else {
          if (mostrarMsg) {
            this.alertaService.mostrarMensagem("Favor informar corretamente os dados para pagamento Parcelado com Entrada!");
            retorno = false;
          }
        }
      }
      if (this.enumFormaPagto == 4)//ParcSemEnt
      {
        retorno = false;
      }
      if (this.enumFormaPagto == 5 &&
        (!this.meioPagtoParcUnica || !this.diasVencParcUnica))//ParcUnica
      {
        if (mostrarMsg) {
          this.alertaService.mostrarMensagem("Favor informar corretamente os dados para pagamento Parcela Única!");
          retorno = false;
        }
      }
      if (this.enumFormaPagto == 6 && (!this.qtde || !this.valor))//ParcCartaoMaquineta
      {
        if (mostrarMsg) {
          this.alertaService.mostrarMensagem("Favor selecionar  corretamente o meio de pagamento " +
            "para Parcelado no Cartão (Maquineta).");
          retorno = false;
        }
      }
      return retorno;
    }
  }

  validarOpcoesPagto(mostrarMsg: boolean): boolean {
    if (this.enumFormaPagto) {
      if (this.enumFormaPagto == 1) {
        if (!this.opcaoPagtoAvista) {
          if (mostrarMsg)
            this.alertaService.mostrarMensagem("Favor selecionar o campo Parcelamento para À vista!");
          return false;
        }
        else {
          //pegamos a qtde e o valor
          this.verificaParcelamento(this.opcaoPagtoAvista);
          return true;
        }
      }
      if (this.enumFormaPagto == 2) {
        if (!this.opcaoPagtoParcCartaoInternet) {
          if (mostrarMsg)
            this.alertaService.mostrarMensagem("Favor selecionar o Parcelamento para Cartão (Internet)!");
          return false;
        }
        else {
          this.verificaParcelamento(this.opcaoPagtoParcCartaoInternet);
          return true;
        }
      }
      if (this.enumFormaPagto == 3) {
        if (this.vlEntrada) {
          if (!this.opcaoPagtoParcComEntrada) {
            if (mostrarMsg)
              this.alertaService.mostrarMensagem("Favor selecionar o Parcelamento para Parcela com entrada!");
            return false;
          }
          else {
            this.verificaParcelamento(this.opcaoPagtoParcComEntrada);
            return true;
          }
        }
        else {
          if (mostrarMsg)
            this.alertaService.mostrarMensagem("Favor informar o valor de entrada!");
          return false;
        }
      }
      if (this.enumFormaPagto == 4) {
        //ParcSemEntrada
      }
      if (this.enumFormaPagto == 5) {
        if (!this.opcaoPagtoParcUnica) {
          if (mostrarMsg)
            this.alertaService.mostrarMensagem("Favor selecionar o Parcelamento para Parcela Única!");
          return false;
        }
        else {
          this.verificaParcelamento(this.opcaoPagtoParcUnica);
          return true;
        }
      }
      if (this.enumFormaPagto == 6) {
        if (!this.opcaoPagtoParcCartaoMaquineta) {
          if (mostrarMsg)
            this.alertaService.mostrarMensagem("Favor selecionar o Parcelamento para Pagamento com cartão (Maquineta)!");
          return false;
        }
        else {
          this.verificaParcelamento(this.opcaoPagtoParcCartaoMaquineta);
          return true;
        }
      }
    }
    else {
      if (mostrarMsg)
        this.alertaService.mostrarMensagem("Favor selecionar uma Forma de Pagamento!");
      return false;
    }
  }

  verificaParcelamento(opcaoPagto: string) {
    if (!!opcaoPagto) {
      this.qtde = parseInt(opcaoPagto.slice(0, 2).trim());
      //correção para não perder as casas decimais
      this.valor = parseFloat(opcaoPagto.substring(7).trim().replace('.', '').replace(',', '')) / 100;
    }
  }

  formaPagtoDto: FormaPagtoDto;
  buscarFormaPagto() {
    return this.prepedidoBuscarService.buscarFormaPagto(this.prePedidoDto.DadosCliente.Tipo).subscribe({
      next: (r: FormaPagtoDto) => {
        if (!!r) {
          this.formaPagtoDto = r;
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de forma de pagamentos")
        }
      },
      error: (r: FormaPagtoDto) => this.alertaService.mostrarErroInternet(r)
    })
  }

  coeficienteDto: CoeficienteDto[];
  buscarCoeficiente(callback: () => void) {
    return this.prepedidoBuscarService.buscarCoeficiente(this.prePedidoDto.ListaProdutos).subscribe({
      next: (r: CoeficienteDto[]) => {
        if (!!r) {
          this.coeficienteDto = r;
          if (callback)
            callback();
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de coeficientes dos fabricantes")
        }
      },
      error: (r: CoeficienteDto) => this.alertaService.mostrarErroInternet(r)
    })
  }

  // foi solicitado que a qtde de parcelas disponível será baseada na
  // qtde de parcelas disponível no cartão Visa(PRAZO_LOJA)
  //então faremos a busca pela API
  qtdeParcVisa: number;
  public buscarQtdeParcCartaoVisa(): void {
    this.prepedidoBuscarService.buscarQtdeParcCartaoVisa().subscribe({
      next: (r: number) => {
        if (!!r) {
          this.qtdeParcVisa = r;
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a quantidade de parcelas!");
        }
      },
      error: (r: number) => this.alertaService.mostrarErroInternet(r)
    })
  }

  //chamado quando algum item do prepedido for alterado
  //aqui é feito a limpeza do select da forma de pagamento
  public prepedidoAlterado() {
    this.recalcularValoresComCoeficiente(this.enumFormaPagto);
    this.opcaoPagtoParcComEntrada = null;
    this.opcaoPagtoAvista = null;
    this.opcaoPagtoParcCartaoInternet = null;
    this.opcaoPagtoParcCartaoMaquineta = null;
    this.opcaoPagtoParcUnica = null;
  }

  constantes = new Constantes();
  lstMsg: string[] = [];
  tipoFormaPagto: string = '';
  coeficienteDtoNovo: CoeficienteDto[][];
  recalcularValoresComCoeficiente(enumFP: number): void {
    //na mudança da forma de pagto iremos zerar todos os campos
    this.zerarTodosCampos();
    if (!!enumFP) {
      this.formaPagtoNum = enumFP;
      //verificar EnumTipoPagto para passar o valor do tipo "AV, SE, CE"
      this.tipoFormaPagto = this.verificaEnum(this.formaPagtoNum);
      //aisamos que está carregando...
      this.lstMsg = new Array();
      this.lstMsg.push("Carregando dados....");
      this.buscarNovoCoeficiente((coefciente: CoeficienteDto[][]) => {
        this.coeficienteDtoNovo = coefciente;
        this.lstMsg = new Array();
        this.lstMsg = this.lstNovoCoeficiente.CalcularTotalProdutosComCoeficiente(this.formaPagtoNum, this.coeficienteDtoNovo,
          this.tipoFormaPagto, this.qtdeParcVisa, this.vlEntrada);
        if (this.formaPagtoNum.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
          this.lstNovoCoeficiente.RecalcularListaProdutos(this.formaPagtoNum, this.coeficienteDtoNovo, this.tipoFormaPagto, 1);
          this.opcaoPagtoAvista = this.lstMsg[0];
        }
        if (this.formaPagtoNum.toString() == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
          this.lstNovoCoeficiente.RecalcularListaProdutos(this.formaPagtoNum, this.coeficienteDtoNovo, this.tipoFormaPagto, 1);
          this.opcaoPagtoParcUnica = this.lstMsg[0];
        }
      });
    }
  }

  formaPagtoNum: number;
  buscarNovoCoeficiente(callback: (coefciente: CoeficienteDto[][]) => void): void {
    this.lstNovoCoeficiente.buscarCoeficienteFornecedores(callback);
  }

  RecalcularListaProdutos() {
    //vamos validar e descobrir a qtde de parcelas que esta sendo selecionado
    if (!this.validarFormaPagto(false)) {
      return false;
    }

    this.lstNovoCoeficiente.RecalcularListaProdutos(this.formaPagtoNum, this.coeficienteDtoNovo, this.tipoFormaPagto,
      this.qtde);
  }

  public zerarTodosCampos(): void {
    this.meioPagtoEntrada = null;
    this.opcaoPagtoAvista = "";
    this.meioPagtoAVista = null;
    this.opcaoPagtoParcUnica = "";
    this.meioPagtoParcUnica = null;
    this.diasVencParcUnica = null;
    this.opcaoPagtoParcComEntrada = "";
    this.meioPagtoEntradaPrest = null;
    this.diasVenc = null;
    this.opcaoPagtoParcCartaoInternet = "";
    this.opcaoPagtoParcCartaoMaquineta = "";
  }

  enumTipoFP = EnumTipoPagto;
  verificaEnum(enumFP: number) {
    if (enumFP == EnumFormaPagto.Avista)
      return this.enumTipoFP.Avista.toString();
    else if (enumFP == EnumFormaPagto.ParcCartaoInternet)
      return this.enumTipoFP.ParcCartaoInternet.toString();
    else if (enumFP == EnumFormaPagto.ParcComEnt)
      return this.enumTipoFP.ParcComEnt.toString();
    else if (enumFP == EnumFormaPagto.ParcSemEnt)
      return this.enumTipoFP.ParcSemEnt.toString();
    else if (enumFP == EnumFormaPagto.ParcUnica)
      return this.enumTipoFP.ParcUnica.toString();
    else if (enumFP == EnumFormaPagto.ParcCartaoMaquineta)
      return this.enumTipoFP.ParcCartaoMaquineta.toString();
  }

  public vlEntrada: number;
  moedaUtils = new MoedaUtils();

  // digitouVlEntrada
  digitouVlEntrada(e: Event) {

    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    this.vlEntrada = v;
  }

  calcularParcelaComEntrada() {
    this.recalcularValoresComCoeficiente(this.formaPagtoNum);
  }

  montaFormaPagtoExistente() {

    if (this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento) {
      this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento;
      switch (this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento.toString()) {

        case this.constantes.COD_FORMA_PAGTO_A_VISTA:
          //A vista
          this.enumFormaPagto = EnumFormaPagto.Avista;//forma de pagamento
          this.opcaoPagtoAvista = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoAVista = parseInt(this.prePedidoDto.FormaPagtoCriacao.Op_av_forma_pagto);//deposito ou...
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA:
          //ParcUnica
          this.enumFormaPagto = EnumFormaPagto.ParcUnica;//forma de pagamento
          this.opcaoPagtoParcUnica = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoParcUnica = parseInt(this.prePedidoDto.FormaPagtoCriacao.Op_pu_forma_pagto);//deposito ou...
          this.diasVencParcUnica = this.prePedidoDto.FormaPagtoCriacao.C_pu_vencto_apos;//dias para venc.
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO:
          //ParcCartaoInternet
          this.enumFormaPagto = EnumFormaPagto.ParcCartaoInternet;//forma de pagamento
          this.opcaoPagtoParcCartaoInternet = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA:
          //ParcCartaoMaquineta
          this.enumFormaPagto = EnumFormaPagto.ParcCartaoMaquineta;//forma de pagamento
          this.opcaoPagtoParcCartaoMaquineta = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA:
          //ParcComEnt
          this.enumFormaPagto = EnumFormaPagto.ParcComEnt;//forma de pagamento
          this.vlEntrada = this.prePedidoDto.FormaPagtoCriacao.C_pce_entrada_valor;//valor de entrada
          this.opcaoPagtoParcComEntrada = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoEntrada = parseInt(this.prePedidoDto.FormaPagtoCriacao.Op_pce_entrada_forma_pagto);//deposito ou...
          this.meioPagtoEntradaPrest = parseInt(this.prePedidoDto.FormaPagtoCriacao.Op_pce_prestacao_forma_pagto);//deposito ou...
          this.diasVenc = this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_periodo;//recebe os dias de vencimento
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA:
          //ParcSemEnt
          this.prePedidoDto.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
          this.prePedidoDto.FormaPagtoCriacao.Op_pse_prim_prest_forma_pagto = "";//meio de pagamento
          this.prePedidoDto.FormaPagtoCriacao.Op_pse_demais_prest_forma_pagto = "";//meio de pagamento
          this.prePedidoDto.FormaPagtoCriacao.C_pse_prim_prest_valor = 0;
          this.prePedidoDto.FormaPagtoCriacao.C_pse_prim_prest_apos = 0;
          this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
          this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_valor = 0;
          this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_periodo = 0;
          this.prePedidoDto.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
          break;
      };
    }
  }

  //metodo para montar o tipo de parcelamento que foi selecionado pelo usuário
  montaParcelamentoExistente(): string {
    let retorno = "";
    this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento;
    this.recalcularValoresComCoeficiente(this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento);

    switch (this.prePedidoDto.FormaPagtoCriacao.Tipo_parcelamento.toString()) {
      case this.constantes.COD_FORMA_PAGTO_A_VISTA:
        retorno = this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.prePedidoDto.VlTotalDestePedido);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA:
        //ParcUnica
        retorno = this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.prePedidoDto.FormaPagtoCriacao.C_pu_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO:
        //ParcCartaoInternet
        retorno = this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.prePedidoDto.FormaPagtoCriacao.C_pc_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA:
        //ParcCartaoMaquineta
        retorno = this.prePedidoDto.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.prePedidoDto.FormaPagtoCriacao.C_pc_maquineta_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA:
        //ParcComEnt
        retorno = this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_qtde + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.prePedidoDto.FormaPagtoCriacao.C_pce_prestacao_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA:
        //ParcSemEnt
        break;
    };

    return retorno;
  }

}

