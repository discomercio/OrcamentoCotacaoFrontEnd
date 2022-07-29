import { Component, OnInit, Inject, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { SelecProdInfo } from './selec-prod-info';
import { ProdutoTela } from './produto-tela';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Table } from 'primeng/table';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { ProdutoDto } from 'src/app/dto/produtos/ProdutoDto';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';

@Component({
  selector: 'app-select-prod-dialog',
  templateUrl: './select-prod-dialog.component.html',
  styleUrls: ['./select-prod-dialog.component.scss']
})
export class SelectProdDialogComponent extends TelaDesktopBaseComponent implements OnInit {
  pageItens: number;
  produtoComboDto: ProdutoComboDto;
  carregandoProdutos: boolean;
  retornaIndividual: boolean = false;

  constructor(@Inject(DynamicDialogConfig) public option: DynamicDialogConfig,
    public readonly autenticacaoService: AutenticacaoService,
    public ref: DynamicDialogRef,
    public readonly mensagemService: MensagemService,
    telaDesktopService: TelaDesktopService,
    public produtoService: ProdutoService,
    private readonly alertaService: AlertaService,
    public cdref: ChangeDetectorRef) {
    super(telaDesktopService);
  }

  @ViewChild('dataTable') table: Table;
  displayModal: boolean = false;
  selecProdInfoPassado: SelecProdInfo;
  public prodsTela: ProdutoTela[] = new Array();
  public prodsArray: ProdutoTela[] = new Array();
  public moedaUtils: MoedaUtils = new MoedaUtils();
  selecionado: ProdutoTela;
  selecionados: Array<ProdutoTela> = new Array();
  codigo: string;
  public ProdutoTelaFabrProd = ProdutoTela.FabrProd;
  stringUtils = StringUtils;

  ngOnInit(): void {
    this.displayModal = true;
    this.selecProdInfoPassado = this.option.data;
    this.pageItens = this.telaDesktop ? 3 : 6;


    this.inscreveProdutoComboDto();

  }

  inscreveProdutoComboDto(): void {
    //if (this.novoOrcamentoService.orcamentoCotacaoDto.loja == undefined) return;

    let produtoRequest: ProdutoRequest = new ProdutoRequest();
    produtoRequest.loja = this.autenticacaoService._lojaLogado;
    produtoRequest.uf = this.option.data.Uf;//this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf;
    produtoRequest.tipoCliente = this.option.data.tipoCliente//this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    produtoRequest.tipoParcela = this.option.data.siglaPagto//this.novoOrcamentoService.siglaPagto;
    produtoRequest.qtdeParcelas = this.option.data.qtdeMaxParcelas//this.formaPagto.qtdeMaxParcelas;
    produtoRequest.dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString().slice(0, 10));
    this.retornaIndividual = this.option.data.retornaIndividual
    this.produtoService.buscarProdutosCompostosXSimples(produtoRequest).toPromise().then((r) => {
      if (r != null) {
        this.selecProdInfoPassado.produtoComboDto = r;
        this.prodsTela = this.prodsArray;
        this.transferirDados();
        this.carregandoProdutos = false;
        this.cdref.detectChanges();
      }
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r);
      this.carregandoProdutos = false;
    });
  }

  public combo: ProdutoComboDto = new ProdutoComboDto();

  public limiteMaximo = 1000 * 1000;
  transferirDados() {

    const limite = this.limiteMaximo;
    for (let copiar = 0; copiar < limite; copiar++) {
      //acabou?
      if (!(this.prodsArray.length < this.selecProdInfoPassado.produtoComboDto.produtosSimples.length))
        break;
      //colocamos mais um
      let xy = new ProdutoTela(this.selecProdInfoPassado.produtoComboDto.produtosSimples[this.prodsArray.length],
        this.selecProdInfoPassado.produtoComboDto.produtosCompostos);

      this.prodsArray.push(xy);
    }
  }



  digitado: string = "";
  digitouProd(e: Event) {
    this.digitado = ((e.target) as HTMLInputElement).value;
    ProdutoTela.AtualizarVisiveis(this.prodsArray, this.digitado);

    this.prodsTela = this.prodsArray.filter(f => f.visivel == true);
  }

  addProduto() {
    // precisa guardar os codigos de produto para fazer um distinct,
    // vamos guardar os produtos já separadamente?? se sim, criar no "novoOrcamentoService" pois assim,
    // saberemos se estamos ultrapassando o limite
    if (this.selecionado) {
      if (!this.retornaIndividual) {
        this.ref.close(this.selecionado);
        return;
      }
      let produtos: Array<ProdutoDto>

      let qtdeItens: number = 0;
      if (this.selecionado.Filhos.length > 0) {
        this.selecionado.Filhos.forEach(x => {
          let produtoComposto = this.selecProdInfoPassado.produtoComboDto.produtosCompostos.filter(c => c.paiProduto == this.selecionado.produtoDto.produto);
          let produto = this.selecProdInfoPassado.produtoComboDto.produtosSimples.filter(c => c.produto == x.produto);
          if (produto) {
            let _produto;
            _produto = new ProdutoTela(produto[0], produtoComposto)
            this.selecionados.push(_produto)
            // produtos.push();
            qtdeItens++;
          }
        });
      }
      else {
        // let produto = this.novoOrcamentoService.controleProduto.filter(c => c == this.selecionado.produtoDto.produto)[0];
        //   if (!produto) {
        //     this.novoOrcamentoService.controleProduto.push(this.selecionado.produtoDto.produto);
        //     qtdeItens++; 
        //   }
      }
      // if (this.novoOrcamentoService.controleProduto.length > this.novoOrcamentoService.limiteQtdeProdutoOpcao) {
      //   this.novoOrcamentoService.controleProduto.splice(this.novoOrcamentoService.controleProduto.length - qtdeItens, qtdeItens);
      //   this.mensagemService.showWarnViaToast("A quantidade de itens excede a quantidade máxima de itens permitida por opção!");
      //   return;
      // }
      this.ref.close(this.selecionados);
      return;
    }
    let msg: string[] = new Array();
    msg.push("Por favor, selecione um produto!");
    this.mensagemService.showErrorViaToast(msg);
  }

  marcarLinha(e: Event) {
    e.stopImmediatePropagation();
  }

  produtoDescr(fabricante: string, produto: string) {
    let p = this.selecProdInfoPassado.produtoComboDto.produtosSimples.filter(el => el.fabricante == fabricante && el.produto == produto)[0];
    return p;
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 641) {
      return true;
    }
    return false;
  }
}
