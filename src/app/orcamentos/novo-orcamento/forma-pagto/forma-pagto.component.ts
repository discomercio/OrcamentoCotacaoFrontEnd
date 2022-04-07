import { Component, OnInit } from '@angular/core';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { MeiosPagto } from 'src/app/dto/forma-pagto/meios-pagto';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Constantes } from 'src/app/utilities/constantes';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ItensComponent } from '../itens/itens.component';
import { NovoOrcamentoService } from '../novo-orcamento.service';

@Component({
  selector: 'app-forma-pagto',
  templateUrl: './forma-pagto.component.html',
  styleUrls: ['./forma-pagto.component.scss']
})
export class FormaPagtoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private readonly formaPagtoService: FormaPagtoService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    public readonly itensComponent: ItensComponent,
    telaDesktopService: TelaDesktopService
  ) {
    super(telaDesktopService);
  }

  ngOnInit(): void {
    this.tipoUsuario = this.autenticacaoService.tipoUsuario;
  }
  checked: boolean = true;
  tipoUsuario: number;
  public constantes: Constantes = new Constantes();
  formaPagamento: FormaPagto[] = new Array();


  buscarFormasPagto() {
    let comIndicacao: number = 0;
    if (this.tipoUsuario == this.constantes.PARCEIRO ||
      this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR)
      comIndicacao = 1;

    let qtdeMaxParcelaCartaoVisa: number = 0;
    if (this.tipoUsuario == this.constantes.GESTOR ||
      this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      this.formaPagtoService.buscarQtdeMaxParcelaCartaoVisa().toPromise().then((r) => {
        if (r != null) {
          qtdeMaxParcelaCartaoVisa = r;
          this.qtdeMaxParcelas = r;
        }
      });
    }

    return this.formaPagtoService.buscarFormaPagto(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo, comIndicacao)
      .toPromise()
      .then((r) => {
        if (r != null) {
          this.formaPagamento = r;
          this.montarFormasPagto();
          this.setarTipoPagto();
        }
      }).catch((e) => this.alertaService.mostrarErroInternet(e));
  }


  formasPagtoAPrazo: FormaPagto[] = new Array();
  formasPagtoAVista: FormaPagto = new FormaPagto();
  montarFormasPagto() {
    if (this.formaPagamento != null) {

      this.formaPagamento.forEach(e => {
        if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
          this.formasPagtoAVista = e;
        }
        else {
          if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
            this.meiosEntrada = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_ENTRADA);
            this.meiosDemaisPrestacoes = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES);
          }
          if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
            this.meioPrimPrest = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_PRIM_PRESTACOES);
            this.meiosDemaisPrestacoes = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES);
          }
          if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
            this.meioParcelaUnica = e.meios;
          }
          this.formasPagtoAPrazo.push(e);
        }
      });
    }
  }

  setarTipoPagto() {
    this.formaPagtoCriacaoAprazo.tipo_parcelamento = this.formasPagtoAPrazo[0].idTipoPagamento;
    if (this.tipoUsuario != this.constantes.GESTOR && this.tipoUsuario != this.constantes.VENDEDOR_UNIS) {
      this.qtdeMaxParcelas = this.formasPagtoAPrazo[0].meios[0].qtdeMaxParcelas;
    }

    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      this.formaPagtoCriacaoAprazo.c_pc_qtde = this.qtdeMaxParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde = this.qtdeMaxParcelas;
    }
    this.setarSiglaPagto();
  }

  setarSiglaPagto() {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      this.novoOrcamentoService.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA;
      return;
    }
    this.novoOrcamentoService.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA;
  }

  meiosEntrada: MeiosPagto[];
  meiosDemaisPrestacoes: MeiosPagto[];
  meioPrimPrest: MeiosPagto[];
  meioParcelaUnica: MeiosPagto[];
  tipoAPrazo: number;
  qtdeMaxParcelas: number;
  qtdeMaxDias: number;
  qtdeMaxPeriodo: number;
  qtdeMaxPeriodoPrimPrest: number;

  selectAprazo() {
    this.tipoAPrazo = this.formaPagtoCriacaoAprazo.tipo_parcelamento;
    this.formaPagtoCriacaoAprazo = new FormaPagtoCriacao();

    this.formaPagtoCriacaoAprazo.tipo_parcelamento = this.tipoAPrazo;
    this.novoOrcamentoService.qtdeParcelas = 0;
    this.qtdeMaxDias = 0;
    this.qtdeMaxParcelas = 0;
    this.qtdeMaxPeriodo = 0;
    this.qtdeMaxPeriodoPrimPrest = 0;

    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      this.qtdeMaxParcelas = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO)[0].meios[0].qtdeMaxParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      this.qtdeMaxParcelas = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA)[0].meios[0].qtdeMaxParcelas;
    }

    this.setarSiglaPagto();
    this.calcularParcelas();
  }

  setarQtdeMaxParcelasEDias() {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      this.qtdeMaxParcelas = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO)[0].meios[0].qtdeMaxParcelas;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let meiosPagtoEntrada = this.formasPagtoAPrazo.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA)[0].meios;

      if (this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto) {
        let meio = meiosPagtoEntrada
          .filter(x => x.id.toString() == this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto &&
            x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES)[0];
        this.qtdeMaxParcelas = meio.qtdeMaxParcelas;
        this.qtdeMaxDias = meio.qtdeMaxDias;
        return;
      }
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      let meios = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA)[0].meios;

      if (this.formaPagtoCriacaoAprazo.op_pse_prim_prest_forma_pagto) {
        let pagto = meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_PRIM_PRESTACOES &&
          x.id.toString() == this.formaPagtoCriacaoAprazo.op_pse_prim_prest_forma_pagto)[0];
        this.qtdeMaxPeriodoPrimPrest = pagto.qtdeMaxDias;
      }
      if (this.formaPagtoCriacaoAprazo.op_pse_demais_prest_forma_pagto) {
        let pagto = meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES &&
          x.id.toString() == this.formaPagtoCriacaoAprazo.op_pse_demais_prest_forma_pagto)[0];
        this.qtdeMaxParcelas = pagto.qtdeMaxParcelas;
        this.qtdeMaxPeriodo = pagto.qtdeMaxDias;
      }
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      let pagto = this.meioParcelaUnica.filter(x => x.id.toString() == this.formaPagtoCriacaoAprazo.op_pu_forma_pagto)[0];
      this.qtdeMaxDias = pagto.qtdeMaxDias;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      this.qtdeMaxParcelas = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA)[0].meios[0].qtdeMaxParcelas;
      return;
    }
  }

  buscarQtdeParcelas(): number {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      return this.formaPagtoCriacaoAprazo.c_pc_qtde;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      return this.formaPagtoCriacaoAprazo.c_pce_prestacao_qtde;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      return this.formaPagtoCriacaoAprazo.c_pse_demais_prest_qtde;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      return 1;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      return this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde;
    }
  }

  formaPagtoCriacaoAprazo: FormaPagtoCriacao = new FormaPagtoCriacao();
  formaPagtoCriacaoAvista: FormaPagtoCriacao = new FormaPagtoCriacao();
  meioDemaisPrestacoes: MeiosPagto[];
  qtdeMaxParcelasEDiasComEntrada() {
    let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA)[0];
    let meiopagto = pagto.meios.filter(x => x.id == Number.parseInt(this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto) &&
      x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES)[0];
    this.qtdeMaxDias = meiopagto.qtdeMaxDias
    this.qtdeMaxParcelas = meiopagto.qtdeMaxParcelas;
  }

  totalAvista: number;
  calcularValorAvista() {
    if (this.formaPagtoCriacaoAvista.tipo_parcelamento && this.formaPagtoCriacaoAvista.tipo_parcelamento[0]) {
      this.totalAvista = this.novoOrcamentoService.totalAVista();
      // this.formaPagtoCriacaoAvista.tipo_parcelamento = Number.parseInt(this.formaPagtoCriacaoAvista.tipo_parcelamento[0]);
      return;
    }
    else {
      this.totalAvista = 0;
    }
  }

  calcularParcelas() {

    if (this.novoOrcamentoService.lstProdutosSelecionados.length <= 0) {
      this.novoOrcamentoService.mensagemService.showWarnViaToast("Por favor, selecione ao menos um produtos!");
      return;
    }
    this.novoOrcamentoService.calcularParcelas(this.buscarQtdeParcelas());
    let valorParcela;
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      let entrada = this.formaPagtoCriacaoAprazo.c_pse_prim_prest_valor ? this.formaPagtoCriacaoAprazo.c_pse_prim_prest_valor : 0;
      valorParcela = (this.novoOrcamentoService.totalPedido() - entrada) / this.novoOrcamentoService.qtdeParcelas;
    }
    else if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let entrada = this.formaPagtoCriacaoAprazo.o_pce_entrada_valor ? this.formaPagtoCriacaoAprazo.o_pce_entrada_valor : 0;
      valorParcela = (this.novoOrcamentoService.totalPedido() - entrada) / this.novoOrcamentoService.qtdeParcelas;
    }
    else {
      valorParcela = this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas;
    }
    this.setarValorParcela(valorParcela);

  }

  setarValorParcela(valorParcelas: number) {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      return this.formaPagtoCriacaoAprazo.c_pc_valor = valorParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      return this.formaPagtoCriacaoAprazo.c_pce_prestacao_valor = valorParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      return this.formaPagtoCriacaoAprazo.c_pse_demais_prest_valor = valorParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      return this.formaPagtoCriacaoAprazo.c_pu_valor = valorParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      return this.formaPagtoCriacaoAprazo.c_pc_maquineta_valor = valorParcelas;
    }
  }

  formatarVlEntrada(e: Event): void {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let valor = ((e.target) as HTMLInputElement).value;
      if (valor != "") {
        let v: any = valor.replace(/\D/g, '');
        v = Number.parseFloat((v / 100).toFixed(2) + '');
        this.formaPagtoCriacaoAprazo.o_pce_entrada_valor = v;
      }
    }

  }

  digitouVlEntrada() {
    let entrada = this.formaPagtoCriacaoAprazo.o_pce_entrada_valor ? this.formaPagtoCriacaoAprazo.o_pce_entrada_valor : 0;
    let valorParcela = (this.novoOrcamentoService.totalPedido() - entrada) / this.novoOrcamentoService.qtdeParcelas;
    this.setarValorParcela(valorParcela);
  }

  formatarPrimPrest(e: Event): void {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      let valor = ((e.target) as HTMLInputElement).value;
      if (valor != "") {
        let v: any = valor.replace(/\D/g, '');
        v = Number.parseFloat((v / 100).toFixed(2) + '');
        this.formaPagtoCriacaoAprazo.c_pse_prim_prest_valor = v;
      }
    }

  }

  digitouPrimPrest() {
    let entrada = this.formaPagtoCriacaoAprazo.c_pse_prim_prest_valor ? this.formaPagtoCriacaoAprazo.c_pse_prim_prest_valor : 0;
    let valorParcela = (this.novoOrcamentoService.totalPedido() - entrada) / this.novoOrcamentoService.qtdeParcelas;
    this.setarValorParcela(valorParcela);
  }

  incluirOpcao() {

    if (this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length == 3) {
      this.novoOrcamentoService.mensagemService.showWarnViaToast("É permitido incluir somente 3 opções de orçamento!");
      return;
    }
    if (this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos.length == 0) {
      this.novoOrcamentoService.mensagemService.showWarnViaToast("Por favor, selecione ao menos um produto!");
      return;
    }
    if (!this.formaPagtoCriacaoAprazo && this.formaPagtoCriacaoAprazo.tipo_parcelamento == 0) {
      //vamos validar cada opção a prazo para saber se todos os campos estão preenchidos
      this.novoOrcamentoService.mensagemService.showWarnViaToast("Forma de pagamento a prazo é obrigatória!");
      return;
    }


    if (!this.formaPagtoCriacaoAvista.tipo_parcelamento || this.formaPagtoCriacaoAvista.tipo_parcelamento != 1) {
        
    }
    let lstFormaPagtoCriacao: FormaPagtoCriacao[] = new Array<FormaPagtoCriacao>();
    lstFormaPagtoCriacao.push(this.formaPagtoCriacaoAprazo);

    if (this.formaPagtoCriacaoAvista.tipo_parcelamento && this.formaPagtoCriacaoAvista.tipo_parcelamento == 1){
      debugger;
      let tipoPagto = this.formaPagtoCriacaoAvista.tipo_parcelamento[0];
      this.formaPagtoCriacaoAvista.tipo_parcelamento = tipoPagto;
      lstFormaPagtoCriacao.push(this.formaPagtoCriacaoAvista);
    }

    this.novoOrcamentoService.atribuirOpcaoPagto(lstFormaPagtoCriacao, this.formaPagamento);


    /**
     * Validar
     *  se o tipo de pagamento a prazo esta com todos os campos preenchidos e válidos
     *  se a forma de pagamento a vista esta selecionada, verificar se os campos estão preenchidos
     *  
     */

    /**
     * Após inserir a opção devemos:
     *  limpar a lista de produtos selecionados em todos os lugares
     *  limpar a lista de controle de produtos de novoOrcamentoService
     *  Limpar as formas de pagamentos e setar a que estava no carregamento da tela
     *  setar a comissão do indicador
     */




    // this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.formaPagto = this.novoOrcamentoService.atribuirOpcaoPagto(this.opcoesPagto, this.qtdeMaxParcelaCartaoVisa);

    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.push(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto);
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.limparCampos();

  }

  limparCampos() {
    this.formaPagtoCriacaoAprazo = new FormaPagtoCriacao();
    this.formaPagtoCriacaoAvista = new FormaPagtoCriacao();
    this.meioDemaisPrestacoes = new Array<MeiosPagto>();    
    this.totalAvista = 0;
    this.setarTipoPagto();

    this.novoOrcamentoService.controleProduto = new Array<string>();
    this.novoOrcamentoService.lstProdutosSelecionados = new Array();
    this.novoOrcamentoService.siglaPagto = "";
    this.novoOrcamentoService.setarPercentualComissao();
  }
}
