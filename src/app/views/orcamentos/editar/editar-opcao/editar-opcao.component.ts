import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ItensComponent } from '../../novo-orcamento/itens/itens.component';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { PercMaxDescEComissaoResponseViewModel } from 'src/app/dto/percentual-comissao';

@Component({
  selector: 'app-editar-opcao',
  templateUrl: './editar-opcao.component.html',
  styleUrls: ['./editar-opcao.component.scss']
})
export class EditarOpcaoComponent implements OnInit, AfterViewInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly lojaService: LojasService,
    private readonly alertaService: AlertaService,
    public cdref: ChangeDetectorRef,
    private readonly sweetalertService: SweetalertService
  ) { }

  @ViewChild("itens", { static: true }) itens: ItensComponent;
  idOpcaoOrcamentoCotacao: number;
  opcaoOrcamento: OrcamentosOpcaoResponse = new OrcamentosOpcaoResponse();
  carregando: boolean;

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    if (!this.itens.param && this.validarEdicao()) {
      this.idOpcaoOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
      this.itens.formaPagto.editando = true;
      this.setarOpcao();
      this.setarProdutosOpcao();

      const promise1: any = [this.itens.formaPagto.buscarFormasPagto2(), this.itens.formaPagto.buscarQtdeMaxParcelas(),
      this.buscarPercentualPorAlcada2()];
      Promise.all(promise1).then((r: any) => {
        this.itens.formaPagto.setarFormasPagto(r[0]);
        this.itens.formaPagto.setarQtdeMaxParcelas(r[1]);
        this.setarPercentualMaxComissao(r[2]);
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.itens.carregandoProds = false;
      }).finally(() => {
        this.buscarProdutos2();
        this.cdref.detectChanges();
        this.atribuirPercRT();
      });

      this.cdref.detectChanges();
    }
    // setTimeout(() => {
    //   this.itens.carregandoProds = false;
    // }, 3000);


  }

  validarEdicao(): boolean {
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor == undefined) {
      this.router.navigate(["/orcamentos/listar/orcamentos"]);
      return;
    }

    return true;
  }

  setarOpcao() {
    this.opcaoOrcamento = this.itens.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.idOpcaoOrcamentoCotacao)[0];
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto = this.opcaoOrcamento;
    this.itens.antigoPercRT = this.opcaoOrcamento.percRT;
    this.itens.novoOrcamentoService.editando = true;
    this.itens.novoOrcamentoService.calcularComissaoAuto = this.verificarCalculoComissao();
  }

  setarParametrosBuscaProdutos() {
    this.itens.produtoRequest = new ProdutoRequest();
    this.itens.produtoRequest.loja = this.itens.novoOrcamentoService.orcamentoCotacaoDto.loja;
    this.itens.produtoRequest.uf = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf;
    this.itens.produtoRequest.tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    this.itens.produtoRequest.tipoParcela = this.setarSiglaPagto();
    this.itens.produtoRequest.qtdeParcelas = this.itens.formaPagto.qtdeMaxParcelas;

    let dataRef = DataUtils.formatarTela(this.itens.novoOrcamentoService.orcamentoCotacaoDto.dataCadastro);
    this.itens.produtoRequest.dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(dataRef);
  }

  buscarProdutos2() {
    this.itens.carregandoProds = true;
    this.setarParametrosBuscaProdutos();
    const promise = [this.itens.buscarProdutos()];
    Promise.all(promise).then((r: any) => {
      this.itens.setarProdutos(r[0]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.itens.carregandoProds = false;
    }).finally(() => {
      this.itens.carregandoProds = false;
      this.cdref.detectChanges();
      this.atribuirPercRT();
    });
  }

  setarSiglaPagto() {
    let tipoPagamento = this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.formaPagto
      .filter(x => x.tipo_parcelamento != this.itens.constantes.COD_FORMA_PAGTO_A_VISTA)[0].tipo_parcelamento;

    if (tipoPagamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      return this.itens.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA;
    }

    return this.itens.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA;
  }

  atribuirPercRT() {
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null) {
      this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = this.opcaoOrcamento.percRT;
    }
  }


  // verificarPermissao() {
  //   if (this.idOpcaoOrcamentoCotacao == undefined || this.itens.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor == undefined) {
  //     this.router.navigate(["/orcamentos/listar/orcamentos"]);
  //     return;
  //   }

  //   this.opcaoOrcamento = this.itens.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.idOpcaoOrcamentoCotacao)[0];
  //   this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto = this.opcaoOrcamento;
  //   this.itens.antigoPercRT = this.opcaoOrcamento.percRT;
  //   this.itens.novoOrcamentoService.editando = true;
  //   this.itens.novoOrcamentoService.calcularComissaoAuto = this.verificarCalculoComissao();

  //   this.buscarProdutos();
  //   if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
  //     this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
  //     this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
  //     this.buscarPercentualPorAlcada();
  //     return;
  //   }

  //   this.buscarFormaPagto();
  //   this.itens.inserirProduto();
  // }

  verificarCalculoComissao(): boolean {
    
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto?.parceiro != this.itens.constantes.SEM_INDICADOR &&
      this.itens.novoOrcamentoService.orcamentoCotacaoDto?.parceiro != null) {

      if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
        this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
        this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
        this.itens.novoOrcamentoService.descontaComissao = false;
        return false;
      }

      let usuarioEnvolvido = this.itens.novoOrcamentoService.verificarUsuarioEnvolvido();
      if (usuarioEnvolvido) {
        this.itens.novoOrcamentoService.descontaComissao = true;
        this.itens.novoOrcamentoService.editarComissao = false;
        return true;
      }
    }

    //não tem parceiro
    //não calcula comissão
    //não tem percRT
    this.itens.novoOrcamentoService.descontaComissao = false;
    return false;
  }

  setarProdutosOpcao() {
    this.opcaoOrcamento.listaProdutos.forEach(x => { if (x.descDado > 0) x.alterouPrecoVenda = true; });
    this.itens.novoOrcamentoService.lstProdutosSelecionados = this.opcaoOrcamento.listaProdutos;
  }

  // buscarProdutos() {

  //   this.opcaoOrcamento.listaProdutos.forEach(x => { if (x.descDado > 0) x.alterouPrecoVenda = true; });
  //   this.itens.novoOrcamentoService.lstProdutosSelecionados = this.opcaoOrcamento.listaProdutos;
  // }

  buscarPercentualPorAlcada2(): Promise<PercMaxDescEComissaoResponseViewModel> {
    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
      let tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
      return this.lojaService.buscarPercentualAlcada(this.autenticacaoService._lojaLogado, tipoCliente).toPromise();
    }

    return;
  }

  setarPercentualMaxComissao(r: PercMaxDescEComissaoResponseViewModel) {
    if (r != null) {
      this.itens.novoOrcamentoService.percentualMaxComissao = r;
      this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar = r.percMaxComissaoEDesconto;
      this.buscarFormaPagto();
      this.itens.inserirProduto();
      // setTimeout(() => {
      //   this.itens.digitouQte(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos[0]);
      // }, 300);

      this.itens.cdref.detectChanges();
    }
  }
  // buscarPercentualPorAlcada() {
  //   let tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
  //   this.lojaService.buscarPercentualAlcada(this.autenticacaoService._lojaLogado, tipoCliente).toPromise().then((r) => {
  //     if (r != null) {
  //       this.itens.novoOrcamentoService.percentualMaxComissao = r;
  //       this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar = r.percMaxComissaoEDesconto;
  //       this.buscarFormaPagto();
  //       this.itens.inserirProduto();
  //       setTimeout(() => {
  //         this.itens.digitouQte(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos[0]);
  //       }, 300);

  //       this.itens.cdref.detectChanges();
  //     }
  //   }).catch((e) => { this.alertaService.mostrarErroInternet(e) });
  // }

  buscarFormaPagto() {
    this.itens.formaPagto.habilitar = false;

    this.setarPagtoAvista();

    let dataRefCoeficiente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.dataCadastro.slice(0, 10);

    this.itens.buscarCoeficientes(dataRefCoeficiente);
    this.itens.cdref.detectChanges();
  }

  setarPagtoAvista() {
    let pagtoAvista = this.opcaoOrcamento.formaPagto.filter(x => x.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_A_VISTA);
    if (pagtoAvista.length > 0) {
      this.itens.formaPagto.formaPagtoCriacaoAvista = pagtoAvista[0];
      this.itens.formaPagto.checkedAvista = true;
      this.itens.formaPagto.calcularValorAvista();
    }
    this.setarPagtoAprazo();
  }

  setarPagtoAprazo() {
    let pagtoPrazo = this.opcaoOrcamento.formaPagto.filter(x => x.tipo_parcelamento != this.itens.constantes.COD_FORMA_PAGTO_A_VISTA);
    if (pagtoPrazo.length > 0) {
      this.itens.formaPagto.formaPagtoCriacaoAprazo = pagtoPrazo[0];
      this.itens.formaPagto.setarQtdeParcelas();

      this.itens.novoOrcamentoService.qtdeParcelas;
      this.itens.formaPagto.cdref.detectChanges();
      this.itens.cdref.detectChanges();
      this.itens.formaPagto.setarSiglaPagto();
    }
    // setTimeout(() => {

    // }, 700);
  }

  salvarOpcao() {
    this.itens.carregandoProds = true;
    if (!this.itens.formaPagto.validarFormasPagto(this.itens.formaPagto.formaPagtoCriacaoAprazo, this.itens.formaPagto.formaPagtoCriacaoAvista)) {
      this.carregando = false;
      return;
    }

    this.itens.formaPagto.atribuirFormasPagto();

    if (!this.validarDescontosProdutos()) {
      this.alertaService.mostrarMensagem("Existe produto que excede o desconto máximo permitido!");
      this.carregando = false;
      return;
    }

    //se tem parceiro
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
      this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.itens.constantes.SEM_INDICADOR) {

      if (!this.itens.novoOrcamentoService.verificarCalculoComissao()) {
        this.atualizaComEdicaoComissao();
        return;
      }

      if (this.itens.novoOrcamentoService.verificarCalculoComissao()) {
        this.atualizaSemEdicaoComissao();
        return;
      }
    }
    else
      this.atualizarOpcao();


  }

  atualizaComEdicaoComissao() {
    let percRT = this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT.toFixed(2);
    if (!this.itens.novoOrcamentoService.validarComissao(percRT)) {
      let descontoMedio = this.itens.novoOrcamentoService.calcularDescontoMedio();
      let limiteComissao = (this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao - (descontoMedio -
        (this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar - this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao))).toFixed(2);

      let pergunta = `Para manter o desconto médio de ${this.itens.moedaUtils.formatarValorDuasCasaReturnZero(descontoMedio)}% a comissão será reduzida para
        ${this.itens.novoOrcamentoService.moedaUtils.formatarPorcentagemUmaCasaReturnZero(Number.parseFloat(limiteComissao))}%. Confirma a redução da comissão?`;
      //fazer uma pergunta se quer arredondar para o valor máximo de desconto
      this.itens.formaPagto.sweetalertService.dialogo("", pergunta).subscribe(result => {
        //se não => return;
        if (!result) {
          this.carregando = false;
          return;
        }

        this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = Number.parseFloat(limiteComissao);
        this.atualizarOpcao();
      });
    }
    else this.atualizarOpcao();
  }

  atualizaSemEdicaoComissao() {
    let antigoPercRT = this.itens.antigoPercRT.toFixed(2);
    let atualPercRT = this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT.toFixed(2);
    if (Number.parseFloat(atualPercRT) < Number.parseFloat(antigoPercRT)) {
      let descontoMedio = this.itens.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(this.itens.novoOrcamentoService.calcularDescontoMedio());
      let pergunta = `Para manter o desconto médio de ${descontoMedio}% a comissão será reduzida para 
      ${this.itens.moedaUtils.formatarPorcentagemUmaCasaReturnZero(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT)}%. Confirma a redução da comissão?`;
      this.itens.formaPagto.sweetalertService.dialogo("", pergunta).subscribe(result => {
        if (!result) {
          this.carregando = false;
          return;
        }

        this.atualizarOpcao();
      });
    }
    else this.atualizarOpcao();
  }

  atualizarOpcao() {
    this.carregando = true;
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.itens.orcamentosService.atualizarOrcamentoOpcao(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetalertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }
      this.carregando = false;
      this.sweetalertService.sucesso("Opcão atualizada com sucesso!");
      this.router.navigate(["orcamentos/aprovar-orcamento", this.itens.novoOrcamentoService.orcamentoCotacaoDto.id]);

    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }

  validarDescontosProdutos(): boolean {

    let limiteDesconto = this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar;
    let descontoMaior = this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos.some(x => {
      if (x.descDado > limiteDesconto) {
        return true;
      }

    });

    if (descontoMaior) return false;

    return true;

  }

  voltar() {
    this.router.navigate(["orcamentos/aprovar-orcamento", this.itens.novoOrcamentoService.orcamentoCotacaoDto.id]);
  }
}
