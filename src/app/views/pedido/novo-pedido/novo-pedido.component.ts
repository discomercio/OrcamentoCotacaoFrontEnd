import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { PrePedidoDto } from 'src/app/dto/prepedido/DetalhesPrepedido/PrePedidoDto';
import { PrepedidoProdutoDtoPrepedido } from 'src/app/dto/prepedido/DetalhesPrepedido/PrepedidoProdutoDtoPrepedido';
import { SelecProdInfo } from 'src/app/dto/prepedido/selec-prod-info';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { ProdutoRequest } from 'src/app/dto/produtos/ProdutoRequest';
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ProdutoTela } from '../../produto/modal/produto-tela';
import { SelectProdDialogComponent } from '../../produto/modal/select-prod-dialog.component';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.component.html',
  styleUrls: ['./novo-pedido.component.scss']
})
export class NovoPedidoComponent extends TelaDesktopBaseComponent implements OnInit {
  //#region Variaveis
  public form: FormGroup;
  public step: number = 1
  cadastrarCliente: boolean = false
  carregandoProdutos: boolean = false
  itemPayment: any;
  lstProdutorRural: any;
  produtoComboDto: ProdutoComboDto;
  selecProdInfo = new SelecProdInfo();

  public pedido: PrePedidoDto = new PrePedidoDto;
  formaPagto: any;
  clicouAdicionarProduto: boolean;
  //#endregion
  constructor(private fb: FormBuilder,
    private readonly alertaService: AlertaService,
    public dialogService: DialogService,
    private prepedidoService: PrepedidoService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private produtoService: ProdutoService,
    telaDesktopService: TelaDesktopService,
    public cdref: ChangeDetectorRef) {
      super(telaDesktopService);
    }

  ngOnInit(): void {
    this.criarForm()
    this.step = 1
    this.cadastrarCliente = false

  }

  criarForm() {
    this.form = this.fb.group({
      Nome: [''],
      CPF: [''],
      RG: [''],
      Sexo: [''],
      Cep: [''],
      Endereco: [''],
      Numero: [''],
      Complemento: [''],
      Bairro: [''],
      Cidade: [''],
      UF: [''],
      Nascimento: [''],
      FoneResidencial: [''],
      FoneCelular: [''],
      FoneComercial: [''],
      Ramal: [''],
      Observacao: [''],
      Email: [''],
      EmailXML: [''],
      ProdutorRural: [''],
      tipoEndereco:['']
    });
  }
  //#region Carga de produtos e busca modal
 
  adicionarProduto(): void {
    this.clicouAdicionarProduto = true;
    this.mostrarProdutos();
  }
  verificarCargaProdutos(): boolean {
    if (this.carregandoProdutos) {
      //ainda não carregou, vamos esperar....
      return false;
    }
    return true;
  }

  async mostrarProdutos() {
    if (!this.verificarCargaProdutos()) {
      return;
    }
    this.selecProdInfo.produtoComboDto = this.produtoComboDto;
    this.selecProdInfo.ClicouOk = false;
    this.selecProdInfo.Uf = this.pedido.DadosCliente.Uf;
    this.selecProdInfo.qtdeMaxParcelas = 12;
    this.selecProdInfo.siglaPagto = this.pedido.DadosCliente.Uf;
    this.selecProdInfo.tipoCliente = this.pedido.DadosCliente.Tipo;
    let largura: string = this.prepedidoService.onResize() ? "" : "65vw";
    const ref = this.dialogService.open(SelectProdDialogComponent,
      {
        width: largura,
        styleClass: 'dynamicDialog',
        data: this.selecProdInfo
      });

    ref.onClose.subscribe((resultado: ProdutoTela) => {
      if (resultado) {
        this.addProdutoSelecionado(resultado);
      }
    });
  }

  addProdutoSelecionado(produto: ProdutoTela) {
    let filtro2 = this.produtoComboDto.produtosSimples.filter(x => x.produto == produto.produtoDto.produto)[0];
    let produtoPrePedido: PrepedidoProdutoDtoPrepedido = new PrepedidoProdutoDtoPrepedido();
    produtoPrePedido.Fabricante = filtro2.fabricante;
    produtoPrePedido.Fabricante_Nome = filtro2.fabricante_Nome;
    produtoPrePedido.Produto = filtro2.produto;
    produtoPrePedido.Descricao = filtro2.descricaoHtml;
    produtoPrePedido.Preco_ListaBase = filtro2.precoListaBase;
    produtoPrePedido.Preco_Lista = filtro2.precoLista;
    produtoPrePedido.CoeficenteDeCalculo = 0;
    produtoPrePedido.Desc_Dado = 0;
    produtoPrePedido.Preco_NF = filtro2.precoLista;
    produtoPrePedido.Preco_Venda = filtro2.precoLista;
    produtoPrePedido.Qtde = 1;
    produtoPrePedido.TotalItem = produtoPrePedido.Preco_Venda * produtoPrePedido.Qtde;
    produtoPrePedido.Alterou_Preco_Venda = false;
    produtoPrePedido.mostrarCampos = this.telaDesktop ? true : false;


    if (this.arrumarProdutosRepetidos(produtoPrePedido)) return;

    this.inserirProduto(produtoPrePedido);
    this.digitouQte(produtoPrePedido);
  }

  arrumarProdutosRepetidos(produto: PrepedidoProdutoDtoPrepedido): boolean {
    // let repetidos = this.novoOrcamentoService.lstProdutosSelecionados.filter(x => x.produto == produto.produto);

    // if (repetidos.length >= 1) {
    //   return this.novoOrcamentoService.lstProdutosSelecionados.some(x => {
    //     const index = this.novoOrcamentoService.lstProdutosSelecionados.findIndex(f => f.produto == produto.produto);
    //     if (x.produto == produto.produto) {
    //       x.qtde++;
    //       this.digitouQte(x);
    //       return true;
    //     }
    //   });
    // }
    // else {
    //   this.novoOrcamentoService.lstProdutosSelecionados.push(produto);
    //   return false;
    // }
    return true
  }

  inserirProduto(produto: PrepedidoProdutoDtoPrepedido): void {

    let dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString().slice(0, 10));
    // if (!this.editando)
    //   this.buscarCoeficientes(dataRefCoeficiente);

    // this.novoOrcamentoService.opcaoOrcamentoCotacaoDto.listaProdutos = this.prepedidoService.lstProdutosSelecionados;

    // this.novoOrcamentoService.totalPedido();

    this.formaPagto.habilitar = false;
  }

  digitouQte(item: PrepedidoProdutoDtoPrepedido): void {
    if (item.Qtde <= 0) item.Qtde = 1;

    item.TotalItem = item.Preco_Venda * item.Qtde;

    // this.formaPagto.setarValorParcela(this.novoOrcamentoService.totalPedido() / this.novoOrcamentoService.qtdeParcelas);
    // this.formaPagto.calcularValorAvista();
    // if (this.novoOrcamentoService.calcularComissaoAuto)
    //   this.novoOrcamentoService.calcularPercentualComissao();
  }
  //#endregion
  //#region Step 1

  preencheDadosCliente(cliente) {
    if (cliente == "novocliente") {
      this.cadastrarCliente = true
      this.step = 2;
    } else {
      this.pedido.DadosCliente.Id = cliente.Id
      this.pedido.DadosCliente.Nome = cliente.Nome
      this.pedido.DadosCliente.Cnpj_Cpf = cliente.Cnpj_Cpf
      this.pedido.DadosCliente.Rg = cliente.Rg
      this.pedido.DadosCliente.Bairro = cliente.Bairro
      this.pedido.DadosCliente.Celular = cliente.Celular
      this.pedido.DadosCliente.Cep = cliente.Cep
      this.pedido.DadosCliente.Endereco = cliente.Endereco
      this.pedido.DadosCliente.Cidade = cliente.Cidade
      this.pedido.DadosCliente.Numero = cliente.Numero
      this.pedido.DadosCliente.Complemento = cliente.Complemento
      this.pedido.DadosCliente.Contato = cliente.Contato
      this.pedido.DadosCliente.DddCelular = cliente.DddCelular
      this.pedido.DadosCliente.DddComercial = cliente.DddComercial
      this.pedido.DadosCliente.DddComercial2 = cliente.DddComercial2
      this.pedido.DadosCliente.DddResidencial = cliente.DddResidencial
      this.pedido.DadosCliente.Email = cliente.Email
      this.pedido.DadosCliente.EmailXml = cliente.EmailXml
      this.pedido.DadosCliente.Observacao_Filiacao = cliente.Observacao_Filiacao
      this.pedido.DadosCliente.TelefoneResidencial = cliente.TelefoneResidencial
      this.pedido.DadosCliente.TelComercial = cliente.TelComercial
      this.pedido.DadosCliente.TelComercial2 = cliente.TelComercial2
      this.pedido.DadosCliente.Ramal = cliente.Ramal
      this.pedido.DadosCliente.Ramal2 = cliente.Ramal2
      this.pedido.DadosCliente.Nascimento = cliente.Nascimento
      this.pedido.DadosCliente.Sexo = cliente.Sexo
      this.pedido.DadosCliente.ProdutorRural = cliente.ProdutorRural
      this.step = 2
      this.cadastrarCliente = false
    }
  }

  preencheEndereco(value: any) {

  }
  //#endregion

  //#region Step2
  btnAvancarCriarCliente() {
    this.step = 3
  }
  //#endregion
}
