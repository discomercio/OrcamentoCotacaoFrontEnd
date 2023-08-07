import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { ItensComponent } from '../../novo-orcamento/itens/itens.component';
import { ProdutoRequest } from 'src/app/dto/produtos/produtoRequest';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { PercMaxDescEComissaoResponseViewModel } from 'src/app/dto/percentual-comissao';
import { ProdutoService } from 'src/app/service/produto/produto.service';

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
    private readonly sweetalertService: SweetalertService,
    private readonly produtoService: ProdutoService
  ) { }

  @ViewChild("itens", { static: true }) itens: ItensComponent;
  idOpcaoOrcamentoCotacao: number;
  opcaoOrcamento: OrcamentosOpcaoResponse;

  ngOnInit(): void {
    this.opcaoOrcamento = new OrcamentosOpcaoResponse();
  }

  ngAfterViewInit() {
    if (!this.itens.param && this.validarEdicao()) {
      this.idOpcaoOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
      this.itens.formaPagto.editando = true;
      this.itens.novoOrcamentoService.descontoGeral = 0;
      this.setarOpcao();
      this.setarProdutosOpcao();

      const promise1: any = [this.itens.formaPagto.buscarFormasPagto(), this.itens.formaPagto.buscarQtdeMaxParcelas(),
      this.buscarPercentualComissao()];
      Promise.all(promise1).then((r: any) => {
        this.itens.formaPagto.setarFormasPagto(r[0]);
        this.itens.formaPagto.setarQtdeMaxParcelas(r[1]);
        this.setarPercentualMaxComissao(r[2]);
      }).catch((e) => {
        this.alertaService.mostrarErroInternet(e);
        this.itens.carregandoProds = false;
      }).finally(() => {
        this.buscarProdutos();
        this.atribuirPercRT();
        this.cdref.detectChanges();
      });

      this.cdref.detectChanges();
    }
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
    this.verificarCalculoComissao();
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

    this.itens.produtoRequest.produtos = this.opcaoOrcamento.listaProdutos.map(x => x.produto);
    this.itens.produtoRequest.idOpcao = this.idOpcaoOrcamentoCotacao;
    let pagto = this.opcaoOrcamento.formaPagto.filter(x => x.tipo_parcelamento != this.itens.constantes.COD_FORMA_PAGTO_A_VISTA)[0];
    this.itens.produtoRequest.idOpcaoFormaPagto = pagto.id;
  }

  buscarProdutos() {
    this.itens.carregandoProds = true;

    this.setarParametrosBuscaProdutos();
    const promise = [this.itens.buscarProdutos(true)];
    Promise.all(promise).then((r: any) => {
      //vamos passar os valores base para os produtos combos e simples
      this.itens.setarProdutos(r[0]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.itens.carregandoProds = false;
    }).finally(() => {
      this.buscarFormaPagto();
      this.itens.inserirProduto();
      this.atribuirPercRT();
      this.itens.novoOrcamentoService.descontoMedio = this.itens.novoOrcamentoService.calcularDescontoMedio();
      this.cdref.detectChanges();
    });
  }

  setarSiglaPagto() {
    let opcao = this.itens.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto
      .filter(x => x.id == this.idOpcaoOrcamentoCotacao)[0];
    if (opcao) {
      let tipoPagamento = opcao.formaPagto
        .filter(x => x.tipo_parcelamento != this.itens.constantes.COD_FORMA_PAGTO_A_VISTA)[0].tipo_parcelamento;

      if (tipoPagamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
        return this.itens.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA;
      }

      return this.itens.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA;
    }
  }

  atribuirPercRT() {
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null) {
      this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = this.opcaoOrcamento.percRT;
    }
  }

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
        this.itens.novoOrcamentoService.descontaComissao = false;
        this.itens.novoOrcamentoService.editarComissao = false;
        this.itens.habilitarComissao = false;
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

  buscarPercentualComissao(): Promise<PercMaxDescEComissaoResponseViewModel> {
    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
      let tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
      return this.lojaService.buscarPercentualAlcada(this.autenticacaoService._lojaLogado, tipoCliente).toPromise();
    } else {
      return this.lojaService.buscarPercentualComissao(this.autenticacaoService.usuario.loja,
        this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo).toPromise();
    }

  }

  setarPercentualMaxComissao(r: PercMaxDescEComissaoResponseViewModel) {
    if (r != null) {
      this.itens.novoOrcamentoService.percentualMaxComissao = r;
      this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao = r.percMaxComissao;
      this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar = r.percMaxComissaoEDesconto;

      this.itens.cdref.detectChanges();
    }
  }

  buscarFormaPagto() {
    this.itens.formaPagto.habilitar = false;

    this.setarPagtoAvista();

    let dataRefCoeficiente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.dataCadastro.slice(0, 10);

    let request = this.itens.setarCoeficienteRequest(dataRefCoeficiente);
    const promise = [this.itens.buscarCoeficientes2(request)];
    Promise.all(promise).then((r: any) => {
      this.itens.setarCoeficienteResponse(r[0]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.itens.carregandoProds = false;
    }).finally(() => {
      this.itens.carregandoProds = false;
    })

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
  }

  salvarOpcao() {
    this.itens.carregandoProds = true;
    if (!this.itens.formaPagto.validarFormasPagto(this.itens.formaPagto.formaPagtoCriacaoAprazo, this.itens.formaPagto.formaPagtoCriacaoAvista)) {
      this.itens.carregandoProds = false;
      return;
    }

    this.itens.formaPagto.atribuirFormasPagto();

    if (!this.validarDescontosProdutos()) {
      this.alertaService.mostrarMensagem("Existe produto que excede o desconto máximo permitido!");
      this.itens.carregandoProds = false;
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

      this.itens.formaPagto.sweetalertService.dialogo("", pergunta).subscribe(result => {
        if (!result) {
          this.itens.carregandoProds = false;
          return;
        }

        this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = Number.parseFloat(limiteComissao);
        this.atualizarOpcao();
      });
    }
    else this.atualizarOpcao();
  }

  atualizaSemEdicaoComissao() {
    let antigoPercRT = this.itens.antigoPercRT;
    let atualPercRT = this.itens.novoOrcamentoService.calcularPercentualComissaoValidacao();
    if (atualPercRT < antigoPercRT) {
      let descontoMedio = this.itens.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(this.itens.novoOrcamentoService.calcularDescontoMedio());
      let pergunta = `Para manter o desconto médio de ${descontoMedio}% a comissão será reduzida para 
      ${this.itens.moedaUtils.formatarPorcentagemUmaCasaReturnZero(atualPercRT)}%. Confirma a redução da comissão?`;
      this.itens.formaPagto.sweetalertService.dialogo("", pergunta).subscribe(result => {
        if (!result) {
          this.itens.carregandoProds = false;
          return;
        }
        this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = atualPercRT;
        this.atualizarOpcao();
      });
    }
    else this.atualizarOpcao();
  }

  atualizarOpcao() {

    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.itens.orcamentosService.atualizarOrcamentoOpcao(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetalertService.aviso(r.Mensagem);
        this.itens.carregandoProds = false;
        return;
      }
      this.itens.carregandoProds = false;
      this.sweetalertService.sucesso("Opcão atualizada com sucesso!");
      this.router.navigate(["orcamentos/aprovar-orcamento", this.itens.novoOrcamentoService.orcamentoCotacaoDto.id]);

    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.itens.carregandoProds = false;
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
