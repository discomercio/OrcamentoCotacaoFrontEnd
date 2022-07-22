import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { ItensComponent } from '../../novo-orcamento/itens/itens.component';

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
    public cdref: ChangeDetectorRef
  ) { }

  @ViewChild("itens", { static: false }) itens: ItensComponent;
  idOpcaoOrcamentoCotacao: number;
  opcaoOrcamento: OrcamentosOpcaoResponse = new OrcamentosOpcaoResponse();


  ngOnInit(): void {


  }

  async ngAfterViewInit() {
    this.idOpcaoOrcamentoCotacao = this.activatedRoute.snapshot.params.id;
    this.verificarPermissao();
    this.cdref.detectChanges();
    this.atribuirPercRT();
  }
  atribuirPercRT() {
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null) {
      this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = this.opcaoOrcamento.percRT;
    }
  }

  verificarPermissao() {
    if (this.idOpcaoOrcamentoCotacao == undefined || this.itens.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor == undefined) {
      this.router.navigate(["/orcamentos/listar/orcamentos"]);
      return;
    }


    let donoOrcamento = this.itens.novoOrcamentoService.VerificarUsuarioLogadoDonoOrcamento();

    if (donoOrcamento.toLocaleLowerCase() != this.autenticacaoService.usuario.nome.toLocaleLowerCase()) {
      if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) &&
        !this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) &&
        !this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3))
        this.router.navigate(["/orcamentos/listar/orcamentos"]);
    }

    this.opcaoOrcamento = this.itens.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.idOpcaoOrcamentoCotacao)[0];
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto = this.opcaoOrcamento;
    this.itens.antigoPercRT = this.opcaoOrcamento.percRT;
    this.itens.novoOrcamentoService.editando = true;
    this.itens.novoOrcamentoService.calcularComissaoAuto = this.verificarCalculoComissao();

    this.buscarProdutos();
    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
      this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
      this.buscarPercentualPorAlcada();
      return;
    }

    this.buscarFormaPagto();
    this.itens.inserirProduto(null);
  }

  verificarCalculoComissao(): boolean {
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto?.parceiro != this.itens.constantes.SEM_INDICADOR &&
      this.itens.novoOrcamentoService.orcamentoCotacaoDto?.parceiro != null) {
      let donoOrcamento = this.itens.novoOrcamentoService.VerificarUsuarioLogadoDonoOrcamento();

      if (donoOrcamento.toLocaleLowerCase() == this.autenticacaoService.usuario.nome.toLocaleLowerCase()) {
        this.itens.novoOrcamentoService.descontaComissao = true;
        this.itens.novoOrcamentoService.editarComissao = false;
        return true;
      }

      if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1) ||
        this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior2) ||
        this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior3)) {
        this.itens.novoOrcamentoService.descontaComissao = false;
        return false;
      }
    }

    //não tem parceiro
    //não calcula comissão
    //não tem percRT
    this.itens.novoOrcamentoService.descontaComissao = false;
    return false;
  }

  buscarProdutos() {

    this.opcaoOrcamento.listaProdutos.forEach(x => { if (x.descDado > 0) x.alterouPrecoVenda = true; });
    this.itens.novoOrcamentoService.lstProdutosSelecionados = this.opcaoOrcamento.listaProdutos;
  }

  buscarPercentualPorAlcada() {
    let tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    this.lojaService.buscarPercentualAlcada(this.autenticacaoService._lojaLogado, tipoCliente).toPromise().then((r) => {
      if (r != null) {
        this.itens.novoOrcamentoService.percentualMaxComissao = r;
        this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar = r.percMaxComissaoEDesconto;
        this.buscarFormaPagto();
        this.itens.inserirProduto(null);
        this.itens.digitouQte(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos[0]);

        this.itens.cdref.detectChanges();
      }
    }).catch((e) => { this.alertaService.mostrarErroInternet(e) });
  }

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
    setTimeout(() => {
      let pagtoPrazo = this.opcaoOrcamento.formaPagto.filter(x => x.tipo_parcelamento != this.itens.constantes.COD_FORMA_PAGTO_A_VISTA);
      if (pagtoPrazo.length > 0) {
        this.itens.formaPagto.formaPagtoCriacaoAprazo = pagtoPrazo[0];
        this.setarQtdeParcelas();

        this.itens.novoOrcamentoService.qtdeParcelas;
        this.itens.formaPagto.cdref.detectChanges();
        this.itens.cdref.detectChanges();
        this.itens.formaPagto.setarSiglaPagto();
      }
    }, 700);
  }

  setarQtdeParcelas() {
    if (this.itens.formaPagto.formaPagtoCriacaoAprazo.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO) {
      this.itens.novoOrcamentoService.qtdeParcelas = this.itens.formaPagto.formaPagtoCriacaoAprazo.c_pc_qtde;
      return;
    }
    if (this.itens.formaPagto.formaPagtoCriacaoAprazo.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      this.itens.novoOrcamentoService.qtdeParcelas = this.itens.formaPagto.formaPagtoCriacaoAprazo.c_pce_prestacao_qtde;
      return;
    }
    if (this.itens.formaPagto.formaPagtoCriacaoAprazo.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
      this.itens.novoOrcamentoService.qtdeParcelas = this.itens.formaPagto.formaPagtoCriacaoAprazo.c_pse_demais_prest_qtde;
      return;
    }
    if (this.itens.formaPagto.formaPagtoCriacaoAprazo.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
      this.itens.novoOrcamentoService.qtdeParcelas = 0;
      return;
    }
    if (this.itens.formaPagto.formaPagtoCriacaoAprazo.tipo_parcelamento == this.itens.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) {
      this.itens.novoOrcamentoService.qtdeParcelas = this.itens.formaPagto.formaPagtoCriacaoAprazo.c_pc_maquineta_qtde;
      return;
    }
  }

  salvarOpcao() {
    if (!this.itens.formaPagto.validarFormasPagto(this.itens.formaPagto.formaPagtoCriacaoAprazo, this.itens.formaPagto.formaPagtoCriacaoAvista)) {
      return;
    }

    this.itens.formaPagto.atribuirFormasPagto();

    if (!this.validarDescontosProdutos()) {
      this.alertaService.mostrarMensagem("Existe produto que excede o desconto máximo permitido!");
      return;
    }

    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null &&
      this.itens.novoOrcamentoService.orcamentoCotacaoDto.parceiro != this.itens.constantes.SEM_INDICADOR) {
      let percRT = this.itens.moedaUtils.formatarValorDuasCasaReturnZero(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT);
      if (!this.itens.novoOrcamentoService.validarComissao(percRT)) {
        let descontoMedio = this.itens.novoOrcamentoService.calcularDescontoMedio();
        let limiteComissao = (this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao - (descontoMedio -
          (this.itens.novoOrcamentoService.percMaxComissaoEDescontoUtilizar - this.itens.novoOrcamentoService.percentualMaxComissao.percMaxComissao))).toFixed(2);

        let pergunta = `A comissão excede o limite máximo permitido, gostaria de recalcular a comissão para o máximo permitido de 
        ${this.itens.moedaUtils.formatarValorDuasCasaReturnZero(Number.parseFloat(limiteComissao))}%`;
        //fazer uma pergunta se quer arredondar para o valor máximo de desconto
        this.itens.formaPagto.sweetalertService.confirmarAprovacao(pergunta, "").subscribe(result => {
          //se não => return;
          if (!result) return;
          
          this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = Number.parseFloat(limiteComissao);
        });
      }

      let antigoPercRT = this.itens.antigoPercRT.toFixed(2);
      if (this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT < Number.parseFloat(antigoPercRT)) {
        let descontoMedio = this.itens.novoOrcamentoService.moedaUtils.formatarValorDuasCasaReturnZero(this.itens.novoOrcamentoService.calcularDescontoMedio());
        let pergunta = `Para manter o desconto médio de ${descontoMedio}% a comissão será reduzida. Confirma a redução da comissão?`;
        this.itens.formaPagto.sweetalertService.confirmarAprovacao(pergunta, "").subscribe(result => {
          if (!result) return;

          this.atualizarOpcao();

        });
      }
      else this.atualizarOpcao();
    }
    else
      this.atualizarOpcao();

    //se for calculado automaticamente, precisamos informar que a comissão foi alterada,
    // para isso o usuário que esta editando não pode ter alçada.
    //verificar se tem parceiro, se percRT é menor que o máximo de percComissao
    //se sim, fazer uma pergunta e seguir somente se a resposta foi sim




  }

  atualizarOpcao() {
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.itens.orcamentosService.atualizarOrcamentoOpcao(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto).toPromise().then((r) => {
      if (r == null) {
        this.router.navigate(["orcamentos/aprovar-orcamento", this.itens.novoOrcamentoService.orcamentoCotacaoDto.id]);
      }
    }).catch((e) => { this.alertaService.mostrarErroInternet(e); });
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
