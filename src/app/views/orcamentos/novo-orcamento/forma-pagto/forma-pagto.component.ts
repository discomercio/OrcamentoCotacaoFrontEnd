import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { MeiosPagto } from 'src/app/dto/forma-pagto/meios-pagto';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Constantes } from 'src/app/utilities/constantes';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ItensComponent } from '../itens/itens.component';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

@Component({
  selector: 'app-forma-pagto',
  templateUrl: './forma-pagto.component.html',
  styleUrls: ['./forma-pagto.component.scss']
})
export class FormaPagtoComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    public readonly formaPagtoService: FormaPagtoService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    public readonly itensComponent: ItensComponent,
    public readonly mensagemService: MensagemService,
    telaDesktopService: TelaDesktopService,
    public cdref: ChangeDetectorRef,
    public readonly sweetalertService: SweetalertService
  ) {
    super(telaDesktopService);
  }

  checked: boolean = true;
  checkedAvista: boolean = false;
  tipoUsuario: number;
  public constantes: Constantes = new Constantes();
  formaPagamento: FormaPagto[] = new Array();
  editando: boolean;
  mostrarBotaoAddOpcao: boolean;
  formasPagtoAPrazo: FormaPagto[] = new Array();
  formasPagtoAVista: FormaPagto = new FormaPagto();
  qtdeMaxParcelaCartaoVisa: number = 0;
  meiosEntrada: MeiosPagto[];
  meiosDemaisPrestacoes: MeiosPagto[];
  meioPrimPrest: MeiosPagto[];
  meioParcelaUnica: MeiosPagto[];
  tipoAPrazo: number;
  qtdeMaxParcelas: number;
  qtdeMaxDias: number;
  qtdeMaxPeriodo: number;
  qtdeMaxPeriodoPrimPrest: number;
  formaPagtoCriacaoAprazo: FormaPagtoCriacao = new FormaPagtoCriacao();
  formaPagtoCriacaoAvista: FormaPagtoCriacao = new FormaPagtoCriacao();
  meioDemaisPrestacoes: MeiosPagto[];
  totalAvista: number;
  habilitar: boolean = true;

  ngOnInit(): void {
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
  }

  buscarFormasPagto(): Promise<FormaPagto[]> {
    let comIndicacao: number = 0;
    let tipoUsuario: number = this.autenticacaoService._tipoUsuario;
    let apelido: string = this.autenticacaoService.usuario.nome;
    let apelidoParceiro: string;
    if (tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      tipoUsuario = this.constantes.VENDEDOR_UNIS;
      apelido = apelido;

      if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
        this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.constantes.SEM_INDICADOR) {
        comIndicacao = 1;
        apelidoParceiro = this.novoOrcamentoService.orcamentoCotacaoDto.parceiro;
      }
      else {
        comIndicacao = 0;
      }
    }
    if (tipoUsuario == this.constantes.PARCEIRO || tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
      tipoUsuario = this.constantes.PARCEIRO;
      apelido = this.novoOrcamentoService.orcamentoCotacaoDto.parceiro;
      comIndicacao = 1;
    }
    return this.formaPagtoService.buscarFormaPagto(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo,
      comIndicacao, tipoUsuario, apelido, apelidoParceiro)
      .toPromise();
  }

  setarFormasPagto(r: FormaPagto[]) {
    if (r != null) {
      this.formaPagamento = r;
      this.montarFormasPagto();
    }
  }

  buscarQtdeMaxParcelas(): Promise<number> {
    return this.formaPagtoService.buscarQtdeMaxParcelaCartaoVisa().toPromise();
  }

  setarQtdeMaxParcelas(r: number) {
    if (r != null) {
      this.qtdeMaxParcelas = r;
      this.qtdeMaxParcelaCartaoVisa = r;

      this.setarTipoPagto();
    }
  }

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
    this.formaPagtoCriacaoAvista.tipo_parcelamento = this.formasPagtoAVista.idTipoPagamento;
    this.formaPagtoCriacaoAvista.op_av_forma_pagto = this.formasPagtoAVista.meios[0].id;
    this.formaPagtoCriacaoAprazo.tipo_parcelamento = this.formasPagtoAPrazo[0].idTipoPagamento;

    let temParceiro = false;
    if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
      this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.constantes.SEM_INDICADOR) {
      temParceiro = true;
    }

    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO)[0];

      this.qtdeMaxParcelas = !temParceiro ? this.qtdeMaxParcelaCartaoVisa : !!pagto.meios[0].qtdeMaxParcelas ? pagto.meios[0].qtdeMaxParcelas : this.qtdeMaxParcelaCartaoVisa;
      this.formaPagtoCriacaoAprazo.c_pc_qtde = this.qtdeMaxParcelas;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA)[0];
      this.qtdeMaxParcelas = !temParceiro ? this.qtdeMaxParcelaCartaoVisa : !!pagto.meios[0].qtdeMaxParcelas ? pagto.meios[0].qtdeMaxParcelas : this.qtdeMaxParcelaCartaoVisa;
      this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde = pagto.meios[0].qtdeMaxParcelas;
    }

    this.setarSiglaPagto()
  }

  setarSiglaPagto() {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      this.novoOrcamentoService.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA;
      return;
    }
    this.novoOrcamentoService.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA;
  }

  selectAprazo() {

    this.tipoAPrazo = this.formaPagtoCriacaoAprazo.tipo_parcelamento;
    let habilitado = this.formaPagtoCriacaoAprazo.habilitado;
    if (this.editando) {
      let idPagto = this.formaPagtoCriacaoAprazo.id;
      let idOpcao = this.formaPagtoCriacaoAprazo.idOpcao;

      this.formaPagtoCriacaoAprazo = new FormaPagtoCriacao();
      this.formaPagtoCriacaoAprazo.id = idPagto;
      this.formaPagtoCriacaoAprazo.idOpcao = idOpcao;
      this.formaPagtoCriacaoAprazo.habilitado = habilitado;
    } else {
      this.formaPagtoCriacaoAprazo = new FormaPagtoCriacao();
    }

    this.formaPagtoCriacaoAprazo.tipo_parcelamento = this.tipoAPrazo;
    this.novoOrcamentoService.qtdeParcelas = 0;
    this.formaPagtoCriacaoAprazo.habilitado = habilitado;

    this.setarSiglaPagto();
    this.calcularParcelas();
  }

  setarQtdeMaxParcelasEDias() {
    let qtdeParcelas = this.buscarQtdeParcelas();
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {

      let qtdeParcela = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO)[0].meios[0].qtdeMaxParcelas;
      if (qtdeParcela != null)
        this.qtdeMaxParcelas = qtdeParcela;

      if (this.qtdeMaxParcelas != null && qtdeParcelas > this.qtdeMaxParcelas) {
        this.formaPagtoCriacaoAprazo.c_pc_qtde = this.qtdeMaxParcelas;
      }
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let meiosPagtoEntrada = this.formasPagtoAPrazo.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA)[0].meios;

      if (this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto) {
        let meio = meiosPagtoEntrada
          .filter(x => x.id.toString() == this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto &&
            x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES)[0];
        if (!meio) {
          return;
        }
        if (meio.qtdeMaxParcelas != null)
          this.qtdeMaxParcelas = meio.qtdeMaxParcelas;
        if (meio.qtdeMaxDias != null)
          this.qtdeMaxDias = meio.qtdeMaxDias;
        if (this.qtdeMaxParcelas != null && qtdeParcelas > this.qtdeMaxParcelas) {
          this.formaPagtoCriacaoAprazo.c_pce_prestacao_qtde = this.qtdeMaxParcelas;
        }
        if (this.qtdeMaxDias != null && this.formaPagtoCriacaoAprazo.c_pce_prestacao_periodo > this.qtdeMaxDias) {
          this.formaPagtoCriacaoAprazo.c_pce_prestacao_periodo = this.qtdeMaxDias;
        }
        return;
      }
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      let meios = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA)[0].meios;

      if (this.formaPagtoCriacaoAprazo.op_pse_prim_prest_forma_pagto) {
        let pagto = meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_PRIM_PRESTACOES &&
          x.id.toString() == this.formaPagtoCriacaoAprazo.op_pse_prim_prest_forma_pagto)[0];

        if (pagto.qtdeMaxDias != null)
          this.qtdeMaxPeriodoPrimPrest = pagto.qtdeMaxDias;

        if (this.qtdeMaxPeriodoPrimPrest != null && this.formaPagtoCriacaoAprazo.c_pse_prim_prest_apos > this.qtdeMaxPeriodoPrimPrest) {
          this.formaPagtoCriacaoAprazo.c_pse_prim_prest_apos = this.qtdeMaxPeriodoPrimPrest;
        }
      }
      if (this.formaPagtoCriacaoAprazo.op_pse_demais_prest_forma_pagto) {
        let pagto = meios.filter(x => x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES &&
          x.id.toString() == this.formaPagtoCriacaoAprazo.op_pse_demais_prest_forma_pagto)[0];

        if (pagto.qtdeMaxParcelas != null)
          this.qtdeMaxParcelas = pagto.qtdeMaxParcelas;

        if (pagto.qtdeMaxDias != null)
          this.qtdeMaxPeriodo = pagto.qtdeMaxDias;

        if (this.qtdeMaxParcelas != null && this.formaPagtoCriacaoAprazo.c_pse_demais_prest_qtde > this.qtdeMaxParcelas) {
          this.formaPagtoCriacaoAprazo.c_pse_demais_prest_qtde = this.qtdeMaxParcelas;
        }
        if (this.qtdeMaxPeriodo != null && this.formaPagtoCriacaoAprazo.c_pse_demais_prest_periodo > this.qtdeMaxPeriodo) {
          this.formaPagtoCriacaoAprazo.c_pse_demais_prest_periodo = this.qtdeMaxPeriodo
        }
      }
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      let pagto = this.meioParcelaUnica.filter(x => x.id.toString() == this.formaPagtoCriacaoAprazo.op_pu_forma_pagto)[0];

      if (!!pagto && pagto.qtdeMaxDias != null)
        this.qtdeMaxDias = pagto.qtdeMaxDias;

      if (this.qtdeMaxDias != null && this.formaPagtoCriacaoAprazo.c_pu_vencto_apos > this.qtdeMaxDias) {
        this.formaPagtoCriacaoAprazo.c_pu_vencto_apos = this.qtdeMaxDias;
      }
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      let qtdeParcela = this.formasPagtoAPrazo
        .filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA)[0].meios[0].qtdeMaxParcelas;

      if (qtdeParcela != null)
        this.qtdeMaxParcelas = qtdeParcela;

      if (this.qtdeMaxParcelas != null && this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde > this.qtdeMaxParcelas) {
        this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde = this.qtdeMaxParcelas
      }
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

  qtdeMaxParcelasEDiasComEntrada() {
    let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA)[0];
    let meiopagto = pagto.meios.filter(x => x.id == Number.parseInt(this.formaPagtoCriacaoAprazo.op_pce_prestacao_forma_pagto) &&
      x.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES)[0];
    this.qtdeMaxDias = meiopagto.qtdeMaxDias
    this.qtdeMaxParcelas = meiopagto.qtdeMaxParcelas;
  }

  calcularValorAvista() {
    // if (!this.checkedAvista) return;
    this.formaPagtoCriacaoAvista.tipo_parcelamento = 1;
    if (this.formaPagtoCriacaoAvista.tipo_parcelamento) {
      this.totalAvista = this.novoOrcamentoService.totalAVista();
      this.novoOrcamentoService.formaPagtoCriacaoAvistaApoio = this.formaPagtoCriacaoAvista;
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
    this.setarQtdeMaxParcelasEDias();

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
    this.novoOrcamentoService.calcularDescontoMedio();
  }

  setarValorParcela(valorParcelas: number) {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {

      return this.formaPagtoCriacaoAprazo.c_pc_valor = this.novoOrcamentoService.moedaUtils.formatarDecimal(valorParcelas);
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      let entrada = this.formaPagtoCriacaoAprazo.o_pce_entrada_valor ? this.formaPagtoCriacaoAprazo.o_pce_entrada_valor : 0;
      return this.formaPagtoCriacaoAprazo.c_pce_prestacao_valor = this.novoOrcamentoService.moedaUtils.formatarDecimal((this.novoOrcamentoService.totalPedido() - entrada) / this.novoOrcamentoService.qtdeParcelas);
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      return this.formaPagtoCriacaoAprazo.c_pse_demais_prest_valor = this.novoOrcamentoService.moedaUtils.formatarDecimal(valorParcelas);
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      return this.formaPagtoCriacaoAprazo.c_pu_valor = this.novoOrcamentoService.moedaUtils.formatarDecimal(valorParcelas);
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      return this.formaPagtoCriacaoAprazo.c_pc_maquineta_valor = this.novoOrcamentoService.moedaUtils.formatarDecimal(valorParcelas);
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
    this.setarValorParcela(0);
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
    //COLOCAR VALIDAÇÃO DE FORMAS DE PAGAMENTOS
    if (this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length == this.novoOrcamentoService.configValidade.LimiteQtdeMaxOpcaoOrcamento) {
      this.novoOrcamentoService.mensagemService.showWarnViaToast(`É permitido incluir somente ${this.novoOrcamentoService.configValidade.LimiteQtdeMaxOpcaoOrcamento} opções de orçamento!`);
      return;
    }
    if (this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos.length == 0) {

      this.novoOrcamentoService.mensagemService.showWarnViaToast("Por favor, selecione ao menos um produto!");
      return;
    }

    let invalidos = this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos.filter(x => x.qtde > this.constantes.QTDE_MAX_ITENS_CRIACAO_ORCAMENTO);
    if (invalidos && invalidos.length > 0) {
      let produtos: string;
      invalidos.forEach(f => {
        produtos = produtos && produtos.length > 0 ? `${produtos}, ${f.produto}` : f.produto;
      });

      if (produtos && produtos.length > 0) {
        produtos = invalidos.length > 1 ? `Os produtos ${produtos} excedem o máximo de caracteres!` : `O produto ${produtos} execede o máximo de caracteres!`;
        this.alertaService.mostrarMensagem(produtos);
        return;
      }
    }

    let validouTodosProdutos: boolean = true;
    this.novoOrcamentoService.listaProdutosDesmembrados.forEach(x => {
      let produtoDto = this.novoOrcamentoService.selecProdInfo.produtoComboDto.produtosSimples.filter(p => p.produto == x.produto);
      if (produtoDto && produtoDto.length > 0) {
        if (x.qtde > produtoDto[0].qtdeMaxVenda) {
          validouTodosProdutos = false;
        }
      }
    });

    if(!validouTodosProdutos){
      this.alertaService.mostrarMensagem("Há produto(s) que excede(m) a quantidade máxima permitida por produto!");
      return;
    }

    if (!this.formaPagtoCriacaoAprazo && this.formaPagtoCriacaoAprazo.tipo_parcelamento == 0) {
      this.novoOrcamentoService.mensagemService.showWarnViaToast("Forma de pagamento a prazo é obrigatória!");
      return;
    }
    if (!this.validarFormasPagto(this.formaPagtoCriacaoAprazo, this.formaPagtoCriacaoAvista)) {
      return;
    }

    if (this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT > this.novoOrcamentoService.percentualMaxComissao.percMaxComissao) {
      this.alertaService.mostrarMensagem("A comissão excedeu o máximo permitido!");
      return;
    }

    if (!this.novoOrcamentoService.validarDescontosProdutos()) {
      this.mensagemService.showErrorViaToast([`Existe produto que excede o máximo permitido!`]);
      return;
    }

    if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
      this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.constantes.SEM_INDICADOR) {
      let comissao = this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT;
      let descontoMedio = this.novoOrcamentoService.calcularDescontoMedio();
      let comissaoMaisDesconto = comissao + descontoMedio;
      if (comissaoMaisDesconto > this.novoOrcamentoService.percMaxComissaoEDescontoUtilizar) {
        let novoPercRT = this.novoOrcamentoService.calcularPercentualComissaoValidacao();
        let pergunta = `Para manter o desconto médio de ${this.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(descontoMedio)}% a comissão será reduzida para
        ${this.novoOrcamentoService.moedaUtils.formatarPorcentagemUmaCasaReturnZero(novoPercRT)}%. Confirma a redução da comissão?`;
        this.sweetalertService.dialogo("", pergunta).subscribe(result => {
          if (!result) {
            return;
          }

          this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = novoPercRT;
          this.gravarOpcao();
        });
      }
      else this.gravarOpcao();
    }
    else this.gravarOpcao();
  }

  gravarOpcao() {

    this.atribuirFormasPagto();

    this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.push(this.novoOrcamentoService.opcaoOrcamentoCotacaoDto);
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    this.limparCampos();
    this.setarQtdeMaxParcelasEDias();
  }

  atribuirFormasPagto() {
    let lstFormaPagtoCriacao: FormaPagtoCriacao[] = new Array<FormaPagtoCriacao>();
    lstFormaPagtoCriacao.push(this.formaPagtoCriacaoAprazo);

    if (this.formaPagtoCriacaoAvista.tipo_parcelamento && this.formaPagtoCriacaoAvista.tipo_parcelamento == 1) {
      lstFormaPagtoCriacao.push(this.formaPagtoCriacaoAvista);
    }

    this.novoOrcamentoService.atribuirOpcaoPagto(lstFormaPagtoCriacao, this.formaPagamento);
  }

  limparCampos() {

    this.formaPagtoCriacaoAprazo = new FormaPagtoCriacao();
    this.novoOrcamentoService.formaPagtoCriacaoAprazoApoio = new FormaPagtoCriacao();

    this.formaPagtoCriacaoAvista = new FormaPagtoCriacao();
    this.novoOrcamentoService.formaPagtoCriacaoAvistaApoio = new FormaPagtoCriacao();
    this.meioDemaisPrestacoes = new Array<MeiosPagto>();
    this.totalAvista = 0;
    this.novoOrcamentoService.descontoGeral = 0;
    this.checkedAvista = false;
    this.setarTipoPagto();

    this.novoOrcamentoService.listaProdutosQtdeApoio = new Array();
    this.novoOrcamentoService.listaProdutosDesmembrados = new Array();
    this.novoOrcamentoService.lstProdutosSelecionados = new Array();
    this.novoOrcamentoService.lstProdutosSelecionadosApoio = new Array();
    this.novoOrcamentoService.setarPercentualComissao();
    this.novoOrcamentoService.percRTApoio = 0;
  }

  validarFormasPagto(pagtoPrazo: FormaPagtoCriacao, pagtoAvista: FormaPagtoCriacao): boolean {


    if (!pagtoPrazo.habilitado && !pagtoAvista.habilitado) {
      this.alertaService.mostrarMensagem("É necessário selecionar ao menos uma forma de pagamento!");
      return false;
    }

    if (pagtoAvista.observacoesGerais && !pagtoAvista.tipo_parcelamento) {
      this.alertaService.mostrarMensagem("Para incluir uma observação para pagamento á vista, " +
        "é necessário que seja selecionado a opção para pagamento á vista!");
      return false;
    }

    let validaPagto = this.formaPagamento.filter(x => x.idTipoPagamento == pagtoPrazo.tipo_parcelamento)[0];
    if (!validaPagto) {
      this.alertaService.mostrarMensagem("Favor preencher os dados para pagamento a prazo!");
      return;
    }

    if (pagtoAvista.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
      if (!pagtoAvista.op_av_forma_pagto) {
        this.alertaService.mostrarMensagem("É necessário selecionar um meio de pagamento para pagamento á vista!");
        return false;
      }
      else {
        let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA);
        if (!!pagto && pagto.length > 0) {
          let meio = pagto[0].meios.filter(x => x.id == pagtoAvista.op_av_forma_pagto)[0];
          if (!meio) {
            this.alertaService.mostrarMensagem("É necessário selecionar um meio de pagamento para pagamento á vista!");
            return;
          }
        }
      }
    }
    if (pagtoPrazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      if (!pagtoPrazo.c_pc_qtde || pagtoPrazo.c_pc_qtde <= 0) {
        this.alertaService.mostrarMensagem("É necessário informar a quantidade de parcelas no cartão de crédito!");
        return false;
      }
      if (!pagtoPrazo.c_pc_valor || pagtoPrazo.c_pc_valor <= 0) {
        this.alertaService.mostrarMensagem("Os valores da parcelas no cartão de crédito está incorreta!");
        return false;
      }
    }
    if (pagtoPrazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      if (!pagtoPrazo.op_pce_entrada_forma_pagto) {
        this.alertaService.mostrarMensagem("Para pagamento com entrada é necessário informar o meio de pagamento da entrada!");
        return false;
      }
      else {
        let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA);
        if (!!pagto && pagto.length > 0) {
          let meio = pagto[0].meios.filter(x => x.id == Number.parseInt(pagtoPrazo.op_pce_entrada_forma_pagto))[0];
          if (!meio) {
            this.alertaService.mostrarMensagem("Para pagamento com entrada é necessário informar o meio de pagamento da entrada!");
            return;
          }
        }
      }
      if (!pagtoPrazo.o_pce_entrada_valor || pagtoPrazo.o_pce_entrada_valor <= 0) {
        this.alertaService.mostrarMensagem("Informe o valor da entrada!");
        return false;
      }
      if (!pagtoPrazo.op_pce_prestacao_forma_pagto) {
        this.alertaService.mostrarMensagem("Para pagamento com entrada é necessário informar o meio de pagamento para demais prestações!");
        return false;
      }
      else {
        let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA);
        if (!!pagto && pagto.length > 0) {
          let meio = pagto[0].meios.filter(x => x.id == Number.parseInt(pagtoPrazo.op_pce_prestacao_forma_pagto))[0];
          if (!meio) {
            this.alertaService.mostrarMensagem("Para pagamento com entrada é necessário informar o meio de pagamento para demais prestações!");
            return;
          }
        }
      }
      if (!pagtoPrazo.c_pce_prestacao_qtde || pagtoPrazo.c_pce_prestacao_qtde <= 0) {
        this.alertaService.mostrarMensagem("Informe a quantidade de prestações!");
        return false;
      }
      if (!pagtoPrazo.c_pce_prestacao_valor || pagtoPrazo.c_pce_prestacao_valor <= 0) {
        this.alertaService.mostrarMensagem("O valor das prestações para pagamento com entrada está incorreto!");
        return false;
      }
      if (!pagtoPrazo.c_pce_prestacao_periodo || pagtoPrazo.c_pce_prestacao_periodo <= 0) {
        this.alertaService.mostrarMensagem("Informe o período de vencimento entre as prestações!");
        return false;
      }
    }
    if (pagtoPrazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      if (!pagtoPrazo.op_pu_forma_pagto) {
        this.alertaService.mostrarMensagem("É necessário informar o meio de pagamento para pagamento com parcela única!");
        return false;
      }
      else {
        let pagto = this.formaPagamento.filter(x => x.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA);
        if (!!pagto && pagto.length > 0) {
          let meio = pagto[0].meios.filter(x => x.id == Number.parseInt(pagtoPrazo.op_pu_forma_pagto))[0];
          if (!meio) {
            this.alertaService.mostrarMensagem("É necessário informar o meio de pagamento para pagamento com parcela única!");
            return;
          }
        }
      }
      if (!pagtoPrazo.c_pu_valor || pagtoPrazo.c_pu_valor <= 0) {
        this.alertaService.mostrarMensagem("O valor da parcela única está incorreto!");
        return false;
      }
      if (!pagtoPrazo.c_pu_vencto_apos) {
        this.alertaService.mostrarMensagem("É necessário informar o dia do vencimento para parcela única!");
        return false;
      }
    }
    if (pagtoPrazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      if (!pagtoPrazo.c_pc_maquineta_qtde || pagtoPrazo.c_pc_maquineta_qtde <= 0) {
        this.alertaService.mostrarMensagem("É necessário informar a quantidade de parcelas no cartão de maquineta!");
        return false;
      }
      if (!pagtoPrazo.c_pc_maquineta_valor || pagtoPrazo.c_pc_maquineta_valor <= 0) {
        this.alertaService.mostrarMensagem("Os valores da parcelas no cartão de crédito está incorreta!");
        return false;
      }
    }

    return true;
  }

  setarQtdeParcelas() {
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      this.novoOrcamentoService.qtdeParcelas = this.formaPagtoCriacaoAprazo.c_pc_qtde;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      this.novoOrcamentoService.qtdeParcelas = this.formaPagtoCriacaoAprazo.c_pce_prestacao_qtde;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      this.novoOrcamentoService.qtdeParcelas = this.formaPagtoCriacaoAprazo.c_pse_demais_prest_qtde;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      this.novoOrcamentoService.qtdeParcelas = 1;
      return;
    }
    if (this.formaPagtoCriacaoAprazo.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      this.novoOrcamentoService.qtdeParcelas = this.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde;
      return;
    }
  }
}
