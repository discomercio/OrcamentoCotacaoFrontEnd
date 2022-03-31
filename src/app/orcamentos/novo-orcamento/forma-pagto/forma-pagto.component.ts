import { Component, OnInit } from '@angular/core';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { MeiosPagto } from 'src/app/dto/forma-pagto/meios-pagto';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { FormaPagtoService } from 'src/app/service/forma-pagto/forma-pagto.service';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Constantes } from 'src/app/utilities/constantes';
import { ItensComponent } from '../itens/itens.component';
import { NovoOrcamentoService } from '../novo-orcamento.service';

@Component({
  selector: 'app-forma-pagto',
  templateUrl: './forma-pagto.component.html',
  styleUrls: ['./forma-pagto.component.scss']
})
export class FormaPagtoComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly alertaService: AlertaService,
    private readonly formaPagtoService: FormaPagtoService,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    public readonly itensComponent: ItensComponent
  ) { }

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
          if(e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA){
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
  meioParcelaUnica:MeiosPagto[];
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
        debugger;

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

  totalAvista:number;
  calcularValorAvista(){
    if(this.formaPagtoCriacaoAvista.tipo_parcelamento && this.formaPagtoCriacaoAvista.tipo_parcelamento[0]){
      this.totalAvista = this.novoOrcamentoService.totalAVista();
      return;
    }
    else{
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
}
