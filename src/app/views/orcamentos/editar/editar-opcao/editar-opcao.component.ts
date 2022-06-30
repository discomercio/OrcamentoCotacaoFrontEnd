import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { LojasService } from 'src/app/service/lojas/lojas.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
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
  }

  verificarPermissao() {
    if (this.idOpcaoOrcamentoCotacao == undefined || this.itens.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor == undefined) {
      this.router.navigate(["/orcamentos/listar/orcamentos"]);
      return;
    }
    if (this.itens.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor.toLocaleLowerCase() !=
      this.autenticacaoService.usuario.nome.toLocaleLowerCase()) {
      if (!this.autenticacaoService.usuario.permissoes.includes(ePermissao.DescontoSuperior1))
        this.router.navigate(["/orcamentos/listar/orcamentos"]);
    }

    this.opcaoOrcamento = this.itens.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.idOpcaoOrcamentoCotacao)[0];
    this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto = this.opcaoOrcamento;

    this.buscarProdutos();
    // this.buscarFormaPagto();
    this.buscarPercentualPorAlcada();

  }

  buscarProdutos() {
    
    this.opcaoOrcamento.listaProdutos.forEach(x => {if(x.descDado > 0) x.alterouPrecoVenda = true;});
    this.itens.novoOrcamentoService.lstProdutosSelecionados = this.opcaoOrcamento.listaProdutos;
  }

  buscarPercentualPorAlcada() {
    let tipoCliente = this.itens.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    this.lojaService.buscarPercentualAlcada(this.autenticacaoService._lojaLogado, tipoCliente).toPromise().then((r) => {
      if (r != null) {
        this.itens.novoOrcamentoService.percentualMaxComissao = r;
        this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.percRT = 0;
        this.buscarFormaPagto();
        this.itens.inserirProduto(null);
        //para refletir as coisas!
        this.itens.digitouQte(this.itens.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos[0]);
        this.itens.cdref.detectChanges();
      }
    }).catch((e) => { this.alertaService.mostrarErroInternet(e) });
  }

  buscarFormaPagto() {
    this.itens.formaPagto.habilitar = false;

    this.setarPagtoAvista();
    // this.setarPagtoAprazo();
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
        console.log(this.itens.formaPagto.formasPagtoAPrazo);
        this.itens.formaPagto.cdref.detectChanges();
        this.itens.cdref.detectChanges();
        this.itens.formaPagto.setarSiglaPagto();
      }
    }, 500);
  }
}
