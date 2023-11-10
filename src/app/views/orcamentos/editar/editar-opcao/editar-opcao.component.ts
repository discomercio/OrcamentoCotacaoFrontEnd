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
import { ProdutoOrcamentoDto } from 'src/app/dto/produtos/ProdutoOrcamentoDto';

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
    this.opcaoOrcamento.loja = this.itens.novoOrcamentoService.orcamentoCotacaoDto.loja;
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto = this.opcaoOrcamento;
    this.itens.antigoPercRT = this.opcaoOrcamento.percRT;
    this.itens.novoOrcamentoService.editando = true;
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
      this.setarListasProdutoControle();
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

  setarProdutosOpcao() {
    this.opcaoOrcamento.listaProdutos.forEach(x => {
      if (x.descDado > 0) x.alterouPrecoVenda = true;
      x.qtdeValida = true;
    });
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

  setarListasProdutoControle() {
    this.itens.novoOrcamentoService.listaProdutosDesmembrados = new Array();
    this.itens.novoOrcamentoService.listaProdutosQtdeApoio = new Array();

    this.itens.novoOrcamentoService.lstProdutosSelecionados.forEach(x => {
      this.itens.novoOrcamentoService.listaProdutosQtdeApoio.push({ produto: x.produto, qtde: x.qtde });

      let produtoDto = this.itens.novoOrcamentoService.produtoComboDto.produtosCompostos.filter(p => p.paiProduto == x.produto);
      if (produtoDto.length > 0) {
        //pegar os filhotes e ir calculando a qtde e adicionando na lista de desmembrados
        produtoDto.forEach(s => {
          s.filhos.forEach(f => {
            let produtoExiste = this.itens.novoOrcamentoService.listaProdutosDesmembrados.filter(p => p.produto == f.produto);
            if (produtoExiste.length > 0) {
              let qtdeCalculada = x.qtde * f.qtde;
              produtoExiste[0].qtde = produtoExiste[0].qtde + qtdeCalculada;
            } else {
              let novo = new ProdutoOrcamentoDto();
              novo.produto = f.produto;
              novo.qtde = x.qtde * f.qtde;
              this.itens.novoOrcamentoService.listaProdutosDesmembrados.push(novo)
            }
          });
        });
      } else {
        let produtoExiste = this.itens.novoOrcamentoService.listaProdutosDesmembrados.filter(p => p.produto == x.produto);
        if (produtoExiste.length > 0) {
          produtoExiste[0].qtde = produtoExiste[0].qtde + x.qtde;
        }
        else {
          let novo = new ProdutoOrcamentoDto();
          novo.produto = x.produto;
          novo.qtde = x.qtde;
          this.itens.novoOrcamentoService.listaProdutosDesmembrados.push(novo)
        }
      }
    });
    debugger;
  }

  salvarOpcao() {
    this.itens.carregandoProds = true;

    let validouTodosProdutos: boolean = true;
    debugger;
    this.itens.novoOrcamentoService.listaProdutosDesmembrados.forEach(x => {
      let produtoDto = this.itens.novoOrcamentoService.produtoComboDto.produtosSimples.filter(p => p.produto == x.produto);
      if (produtoDto && produtoDto.length > 0) {
        if (x.qtde > produtoDto[0].qtdeMaxVenda) {
          validouTodosProdutos = false;
        }
      }
    });
    
    if (!validouTodosProdutos) {
      this.itens.carregandoProds = false;
      this.alertaService.mostrarMensagem("Há produto(s) que excede(m) a quantidade máxima permitida por produto!");
      return;
    }

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

    if (this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT > this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao) {
      this.alertaService.mostrarMensagem("A comissão excedeu o máximo permitido!");
      this.itens.carregandoProds = false;
      return;
    }

    //se tem parceiro
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
      this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.itens.constantes.SEM_INDICADOR) {
      let comissao = this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT;
      let descontoMedio = this.itens.novoOrcamentoService.calcularDescontoMedio();
      let comissaoMaisDesconto = Number.parseFloat(this.itens.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(comissao + descontoMedio));

      if (comissaoMaisDesconto > this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar) {
        let novoPercRT = this.itens.novoOrcamentoService.calcularPercentualComissaoValidacao();
        let pergunta = `Para manter o desconto médio de ${this.itens.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(descontoMedio)}% a comissão será reduzida para
          ${this.itens.novoOrcamentoService.moedaUtils.formatarPorcentagemUmaCasaReturnZero(novoPercRT)}%. Confirma a redução da comissão?`;
        this.sweetalertService.dialogo("", pergunta).subscribe(result => {
          if (!result) {
            this.itens.carregandoProds = false;
            return;
          }

          this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = novoPercRT;
          this.atualizarOpcao();
        });
      }
      else this.atualizarOpcao();
    }
    else
      this.atualizarOpcao();
  }

  atualizarOpcao() {

    // this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.loja = this.opcaoOrcamento.loja;
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
