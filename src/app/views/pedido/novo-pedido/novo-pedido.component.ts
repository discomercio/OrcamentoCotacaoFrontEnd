import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { FormaPagto } from 'src/app/dto/forma-pagto/forma-pagto';
import { FormaPagtoDto } from 'src/app/dto/forma-pagto/FormaPagtoDto';
import { MeiosPagto } from 'src/app/dto/forma-pagto/meios-pagto';
import { PrePedidoDto } from 'src/app/dto/prepedido/DetalhesPrepedido/PrePedidoDto';
import { PrepedidoProdutoDtoPrepedido } from 'src/app/dto/prepedido/DetalhesPrepedido/PrepedidoProdutoDtoPrepedido';
import { SelecProdInfo } from 'src/app/dto/prepedido/selec-prod-info';
import { CoeficienteDto } from 'src/app/dto/produtos/coeficienteDto';
import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';
import { PrepedidoService } from 'src/app/service/prepedido/prepedido.service';
import { ProdutoService } from 'src/app/service/produto/produto.service';
import { Constantes } from 'src/app/utilities/constantes';
import { eFormaPagto } from 'src/app/utilities/enums/eFormaPagto';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
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
  lstProdutorRural: any = [];
  lstSexo: any = [];
  lstContribuinte: any = [];
  produtoComboDto: ProdutoComboDto = new ProdutoComboDto;
  selecProdInfo = new SelecProdInfo();
  editarComissao: boolean = false
  descontaComissao: boolean = false
  public constantes: Constantes = new Constantes
  public moedaUtils: MoedaUtils = new MoedaUtils
  eFormaPagto = eFormaPagto
  public pedido: PrePedidoDto = new PrePedidoDto;
  stringUtils = StringUtils;

  formasPagtoAPrazo: FormaPagto[] = new Array();
  formasPagtoAVista: FormaPagto = new FormaPagto();
  formaPagamento: FormaPagto[] = new Array();
  meiosEntrada: MeiosPagto[];
  meiosDemaisPrestacoes: MeiosPagto[];
  meioPrimPrest: MeiosPagto[];
  meioParcelaUnica: MeiosPagto[];
  tipoAPrazo: number;
  qtdeMaxParcelas: number;
  qtdeMaxDias: number;
  qtdeMaxPeriodo: number;
  qtdeMaxPeriodoPrimPrest: number;

  formaPagto: any = FormaPagto;
  clicouAdicionarProduto: boolean;
  enumFormaPagto: any;
  opcaoPagtoParcUnica: string;
  meioPagtoParcUnica: number;
  diasVencParcUnica: number;
  opcaoPagtoParcCartaoInternet: string;
  opcaoPagtoParcCartaoMaquineta: string;
  vlEntrada: number;
  opcaoPagtoParcComEntrada: string;
  meioPagtoEntrada: number;
  meioPagtoEntradaPrest: number;
  diasVenc: number;
  formaPagtoNum: number;
  lstNovoCoeficiente: any;
  opcaoPagtoAvista: string;
  meioPagtoAVista: number;
  lstFormasPagto: any;
  //#endregion
  constructor(private fb: FormBuilder,
    private readonly alertaService: AlertaService,
    public dialogService: DialogService,
    private prepedidoService: PrepedidoService,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private produtoService: ProdutoService,
    telaDesktopService: TelaDesktopService,
    public cdref: ChangeDetectorRef,
    ) {
    super(telaDesktopService);
  }

  ngOnInit(): void {
    this.criarForm()
    this.step = 1
    this.cadastrarCliente = false
    this.lstProdutorRural.push({ label: "Selecione", value: -1 })
    this.lstProdutorRural.push({ label: "Sim", value: 1 })
    this.lstProdutorRural.push({ label: "Não", value: 0 })

    this.lstSexo.push({ label: "Selecione", value: -1 })
    this.lstSexo.push({ label: "Masculino", value: 1 })
    this.lstSexo.push({ label: "Feminino", value: 0 })

    this.lstContribuinte.push({ label: "Selecione", value: -1 })
    this.lstContribuinte.push({ label: "Sim", value: 1 })
    this.lstContribuinte.push({ label: "Não", value: 0 })
    this.lstContribuinte.push({ label: "Isento", value: 0 })
  }

  criarForm() {
    this.form = this.fb.group({
      Nome: [''],
      CPF: [''],
      CNPJ: [''],
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
      TelefoneResidencial: [''],
      Celular: [''],
      TelComercial: [''],
      TelComercial2: [''],
      Ramal: [''],
      Ramal2: [''],
      Observacao: [''],
      Email: [''],
      EmailXML: [''],
      ProdutorRural: [''],
      tipoEndereco: [''],
      EnderecoEntregaEndEtg_endereco: [''],
      Contribuinte_Icms_Status: [''],
      IE: [''],
      formaPagamento: ['']
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

  setarSiglaPagto() {
    if (this.pedido.FormaPagtoCriacao.Tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
      this.pedido.FormaPagtoCriacao.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA;
      return;
    }
    this.pedido.FormaPagtoCriacao.siglaPagto = this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA;
  }

  async mostrarProdutos() {
    if (!this.verificarCargaProdutos()) {
      return;
    }
    this.setarSiglaPagto();
    this.selecProdInfo.produtoComboDto = this.produtoComboDto;
    this.selecProdInfo.ClicouOk = false;
    this.selecProdInfo.Uf = this.pedido.DadosCliente.Uf;
    this.selecProdInfo.qtdeMaxParcelas = 12;
    this.selecProdInfo.siglaPagto = this.pedido.FormaPagtoCriacao.siglaPagto;
    this.selecProdInfo.tipoCliente = this.pedido.DadosCliente.Tipo;
    this.selecProdInfo.retornaIndividual = true
    let largura: string = this.prepedidoService.onResize() ? "" : "65vw";
    const ref = this.dialogService.open(SelectProdDialogComponent,
      {
        width: largura,
        styleClass: 'dynamicDialog',
        data: this.selecProdInfo
      });

    ref.onClose.subscribe((resultado: Array<ProdutoTela>) => {
      if (resultado) {
        this.addProdutoSelecionado(resultado);
      }
    });
  }

  addProdutoSelecionado(produto: Array<ProdutoTela>) {
    //let filtro2 = this.produtoComboDto.produtosSimples.filter(x => x.produto == produto.produtoDto.produto)[0];

    produto.forEach(x => {
      let produtoPrePedido: PrepedidoProdutoDtoPrepedido = new PrepedidoProdutoDtoPrepedido();
      produtoPrePedido.Fabricante = x.produtoDto.fabricante;// filtro2.fabricante;
      produtoPrePedido.Fabricante_Nome = x.produtoDto.fabricante_Nome;
      produtoPrePedido.Produto = x.produtoDto.produto;
      produtoPrePedido.Descricao = x.produtoDto.descricaoHtml;
      produtoPrePedido.Preco_ListaBase = x.produtoDto.precoListaBase;
      produtoPrePedido.Preco_Lista = x.produtoDto.precoLista;
      produtoPrePedido.CoeficenteDeCalculo = 0;
      produtoPrePedido.Desc_Dado = 0;
      produtoPrePedido.Preco_NF = x.produtoDto.precoLista;
      produtoPrePedido.Preco_Venda = x.produtoDto.precoLista;
      produtoPrePedido.Qtde = 1;
      produtoPrePedido.TotalItem = produtoPrePedido.Preco_Venda * produtoPrePedido.Qtde;
      produtoPrePedido.Alterou_Preco_Venda = false;
      produtoPrePedido.mostrarCampos = this.telaDesktop ? true : false;


      if (this.arrumarProdutosRepetidos(produtoPrePedido)) return;

      this.inserirProduto(produtoPrePedido);
      this.digitouQte(produtoPrePedido);
    });
  }

  arrumarProdutosRepetidos(produto: PrepedidoProdutoDtoPrepedido): boolean {
    let repetidos = this.pedido.ListaProdutos.filter(x => x.Produto == produto.Produto);

    if (repetidos.length >= 1) {
      return this.pedido.ListaProdutos.some(x => {
        const index = this.pedido.ListaProdutos.findIndex(f => f.Produto == produto.Produto);
        if (x.Produto == produto.Produto) {
          x.Qtde++;
          this.digitouQte(x);
          return true;
        }
      });
    }
    else {
      this.pedido.ListaProdutos.push(produto);
      return false;
    }
  }

  removerItem(index: number) {
    let produto = this.pedido.ListaProdutos.splice(index, 1)[0];

    // this.removerProdutoDaListaControle(produto);

    this.digitouQte(produto);
  }

  inserirProduto(produto: PrepedidoProdutoDtoPrepedido): void {

    let dataRefCoeficiente = DataUtils.formata_dataString_para_formato_data(new Date().toLocaleString().slice(0, 10));
    //this.pedido.ListaProdutos.push(produto);
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
    if (cliente.Nome == "novocliente") {
      this.pedido.DadosCliente.Cnpj_Cpf = cliente.Cnpj_Cpf
      this.pedido.DadosCliente.Tipo = cliente.Tipo
      this.cadastrarCliente = true
      this.step = 2;
    } else {
      this.pedido.DadosCliente.Tipo = cliente.Tipo
      this.pedido.DadosCliente.Id = cliente.Id
      this.pedido.DadosCliente.Nome = cliente.Nome
      this.pedido.DadosCliente.Cnpj_Cpf = cliente.Cnpj_Cpf
      this.pedido.DadosCliente.Rg = cliente.Rg
      this.pedido.DadosCliente.Bairro = cliente.Bairro
      this.pedido.DadosCliente.Celular = cliente.Celular
      this.pedido.DadosCliente.Cep = cliente.Cep
      this.pedido.DadosCliente.Uf = cliente.Uf
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

  preencheEnderecoEntrega(value: any) {
    if (value.length > 0)
      value = value[0]
    this.pedido.EnderecoEntrega = new EnderecoEntregaDtoClienteCadastro();
    this.pedido.EnderecoEntrega.EndEtg_bairro = value.Bairro
    this.pedido.EnderecoEntrega.EndEtg_cep = value.Cep
    this.pedido.EnderecoEntrega.EndEtg_uf = value.Uf
    this.pedido.EnderecoEntrega.EndEtg_endereco = value.Endereco
    this.pedido.EnderecoEntrega.EndEtg_cidade = value.Cidade
    this.pedido.EnderecoEntrega.EndEtg_endereco_numero = value.Numero
    this.pedido.EnderecoEntrega.EndEtg_endereco_complemento = value.Complemento
  }
  preencheEnderecoCliente(value: any) {
    if (value.length > 0)
      value = value[0]
    this.pedido.DadosCliente.Bairro = value.Bairro
    this.pedido.DadosCliente.Cep = value.Cep
    this.pedido.DadosCliente.Uf = value.Uf
    this.pedido.DadosCliente.Endereco = value.Endereco
    this.pedido.DadosCliente.Cidade = value.Cidade
    this.pedido.DadosCliente.Numero = value.Numero
    this.pedido.DadosCliente.Complemento = value.Complemento
  }

  preencheEndereco(value: any) {
    this.preencheEnderecoCliente(value)
    this.preencheEnderecoEntrega(value)
  }
  //#endregion

  //#region Step2
  btnAvancarCriarCliente() {
    this.pedido.EnderecoEntregaMesmoEnderecoCliente = true
    this.preencheEnderecoEntrega(this.pedido.DadosCliente)
    console.log(this.pedido)
    this.step = 3

    this.buscarQtdeParcCartaoVisa();
    // this.verificarEmProcesso();
    this.buscarFormaPagto();
    // this.buscarCoeficiente(null);
    // this.buscarNovoCoeficiente();
    setTimeout(() => {
      this.montaFormaPagtoExistente();
    }, 300);
  }
  //#endregion

  //#region Forma de Pagamento

  // foi solicitado que a qtde de parcelas disponível será baseada na
  // qtde de parcelas disponível no cartão Visa(PRAZO_LOJA)
  //então faremos a busca pela API
  qtdeParcVisa: number;
  public buscarQtdeParcCartaoVisa(): void {
    this.prepedidoService.buscarQtdeParcCartaoVisa().subscribe({
      next: (r: number) => {
        if (!!r) {
          this.qtdeParcVisa = r;
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a quantidade de parcelas!");
        }
      },
      error: (r: number) => this.alertaService.mostrarErroInternet(r)
    })
  }

  formaPagtoDto: FormaPagtoDto;
  buscarFormaPagto() {
    return this.prepedidoService.buscarFormaPagto(this.pedido.DadosCliente.Tipo).subscribe({
      next: (r: FormaPagtoDto) => {
        if (!!r) {
          this.formaPagtoDto = r;
          this.lstFormasPagto = Array<any>()
          if(r.ListaAvista){
            this.lstFormasPagto.push({ name: "À vista", value: eFormaPagto.Avista })
          }
          if(r.ListaParcComEntPrestacao){

          }
          if(r.ListaParcComEntrada){
            this.lstFormasPagto.push({ name: "Parcelado com entrada", value: eFormaPagto.ParcComEnt })
          }
          if(r.ListaParcSemEntPrestacao){

          }
          if(r.ListaParcSemEntPrimPrest){
            this.lstFormasPagto.push({ name: "Parcelado sem entrada", value: eFormaPagto.ParcSemEnt })
          }
          if(r.ListaParcUnica){
            this.lstFormasPagto.push({ name: "Parcela única", value: eFormaPagto.ParcUnica })
          }
          if(r.ParcCartaoInternet){
            this.lstFormasPagto.push({ name: "Parcelado Cartão Internet", value: eFormaPagto.ParcCartaoInternet })
          }
          if(r.ParcCartaoMaquineta){
            this.lstFormasPagto.push({ name: "Parcelado Cartão Maquineta", value: eFormaPagto.ParcCartaoMaquineta })
          }
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de forma de pagamentos")
        }
      },
      error: (r: FormaPagto) => this.alertaService.mostrarErroInternet(r)
    })
  }

  montaFormaPagtoExistente() {

    if (this.pedido.FormaPagtoCriacao.Tipo_parcelamento) {
      this.pedido.FormaPagtoCriacao.Tipo_parcelamento;
      switch (this.pedido.FormaPagtoCriacao.Tipo_parcelamento.toString()) {

        case this.constantes.COD_FORMA_PAGTO_A_VISTA.toString():
          //A vista
          this.enumFormaPagto = eFormaPagto.Avista;//forma de pagamento
          this.opcaoPagtoAvista = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoAVista = parseInt(this.pedido.FormaPagtoCriacao.Op_av_forma_pagto);//deposito ou...
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA.toString():
          //ParcUnica
          this.enumFormaPagto = eFormaPagto.ParcUnica;//forma de pagamento
          this.opcaoPagtoParcUnica = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoParcUnica = parseInt(this.pedido.FormaPagtoCriacao.Op_pu_forma_pagto);//deposito ou...
          this.diasVencParcUnica = this.pedido.FormaPagtoCriacao.C_pu_vencto_apos;//dias para venc.
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO.toString():
          //ParcCartaoInternet
          this.enumFormaPagto = eFormaPagto.ParcCartaoInternet;//forma de pagamento
          this.opcaoPagtoParcCartaoInternet = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA.toString():
          //ParcCartaoMaquineta
          this.enumFormaPagto = eFormaPagto.ParcCartaoMaquineta;//forma de pagamento
          this.opcaoPagtoParcCartaoMaquineta = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA.toString():
          //ParcComEnt
          this.enumFormaPagto = eFormaPagto.ParcComEnt;//forma de pagamento
          this.vlEntrada = this.pedido.FormaPagtoCriacao.C_pce_entrada_valor;//valor de entrada
          this.opcaoPagtoParcComEntrada = this.montaParcelamentoExistente();//recebe a descrição (1 X R$ 00,00)
          this.meioPagtoEntrada = parseInt(this.pedido.FormaPagtoCriacao.Op_pce_entrada_forma_pagto);//deposito ou...
          this.meioPagtoEntradaPrest = parseInt(this.pedido.FormaPagtoCriacao.Op_pce_prestacao_forma_pagto);//deposito ou...
          this.diasVenc = this.pedido.FormaPagtoCriacao.C_pce_prestacao_periodo;//recebe os dias de vencimento
          break;
        case this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA.toString():
          //ParcSemEnt
          this.pedido.FormaPagtoCriacao.Rb_forma_pagto = this.enumFormaPagto.toString();
          this.pedido.FormaPagtoCriacao.Op_pse_prim_prest_forma_pagto = "";//meio de pagamento
          this.pedido.FormaPagtoCriacao.Op_pse_demais_prest_forma_pagto = "";//meio de pagamento
          this.pedido.FormaPagtoCriacao.C_pse_prim_prest_valor = 0;
          this.pedido.FormaPagtoCriacao.C_pse_prim_prest_apos = 0;
          this.pedido.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
          this.pedido.FormaPagtoCriacao.C_pse_demais_prest_valor = 0;
          this.pedido.FormaPagtoCriacao.C_pse_demais_prest_periodo = 0;
          this.pedido.FormaPagtoCriacao.C_pse_demais_prest_qtde = 0;
          break;
      };
    }
  }

  //metodo para montar o tipo de parcelamento que foi selecionado pelo usuário
  montaParcelamentoExistente(): string {
    let retorno = "";
    this.pedido.FormaPagtoCriacao.Tipo_parcelamento;
    this.recalcularValoresComCoeficiente(this.pedido.FormaPagtoCriacao.Tipo_parcelamento);

    switch (this.pedido.FormaPagtoCriacao.Tipo_parcelamento.toString()) {
      case this.constantes.COD_FORMA_PAGTO_A_VISTA.toString():
        retorno = this.pedido.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.pedido.VlTotalDestePedido);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA.toString():
        //ParcUnica
        retorno = this.pedido.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.pedido.FormaPagtoCriacao.C_pu_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO.toString():
        //ParcCartaoInternet
        retorno = this.pedido.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.pedido.FormaPagtoCriacao.C_pc_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA.toString():
        //ParcCartaoMaquineta
        retorno = this.pedido.FormaPagtoCriacao.Qtde_Parcelas + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.pedido.FormaPagtoCriacao.C_pc_maquineta_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA.toString():
        //ParcComEnt
        retorno = this.pedido.FormaPagtoCriacao.C_pce_prestacao_qtde + " X " +
          this.moedaUtils.formatarMoedaComPrefixo(this.pedido.FormaPagtoCriacao.C_pce_prestacao_valor);
        break;
      case this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA.toString():
        //ParcSemEnt
        break;
    };

    return retorno;
  }

  lstMsg: string[] = [];
  tipoFormaPagto: string = '';
  coeficienteDtoNovo: CoeficienteDto[][];
  recalcularValoresComCoeficiente(enumFP: number): void {
    //na mudança da forma de pagto iremos zerar todos os campos
    this.zerarTodosCampos();
    if (!!enumFP) {
      this.formaPagtoNum = enumFP;
      //verificar EnumTipoPagto para passar o valor do tipo "AV, SE, CE"
      this.tipoFormaPagto = this.verificaEnum(this.formaPagtoNum);
      //aisamos que está carregando...
      this.lstMsg = new Array();
      this.lstMsg.push("Carregando dados....");
      this.buscarNovoCoeficiente((coefciente: CoeficienteDto[][]) => {
        this.coeficienteDtoNovo = coefciente;
        this.lstMsg = new Array();
        this.lstMsg = this.lstNovoCoeficiente.CalcularTotalProdutosComCoeficiente(this.formaPagtoNum, this.coeficienteDtoNovo,
          this.tipoFormaPagto, this.qtdeParcVisa, this.vlEntrada);
        if (this.formaPagtoNum.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA.toString()) {
          this.lstNovoCoeficiente.RecalcularListaProdutos(this.formaPagtoNum, this.coeficienteDtoNovo, this.tipoFormaPagto, 1);
          this.opcaoPagtoAvista = this.lstMsg[0];
        }
        if (this.formaPagtoNum.toString() == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA.toString()) {
          this.lstNovoCoeficiente.RecalcularListaProdutos(this.formaPagtoNum, this.coeficienteDtoNovo, this.tipoFormaPagto, 1);
          this.opcaoPagtoParcUnica = this.lstMsg[0];
        }
      });
    }
  }

  buscarNovoCoeficiente(callback: (coefciente: CoeficienteDto[][]) => void): void {
    this.lstNovoCoeficiente.buscarCoeficienteFornecedores(callback);
  }

  enumTipoFP = eFormaPagto;
  verificaEnum(enumFP: number) {
    if (enumFP == eFormaPagto.Avista)
      return this.enumTipoFP.Avista.toString();
    else if (enumFP == eFormaPagto.ParcCartaoInternet)
      return this.enumTipoFP.ParcCartaoInternet.toString();
    else if (enumFP == eFormaPagto.ParcComEnt)
      return this.enumTipoFP.ParcComEnt.toString();
    else if (enumFP == eFormaPagto.ParcSemEnt)
      return this.enumTipoFP.ParcSemEnt.toString();
    else if (enumFP == eFormaPagto.ParcUnica)
      return this.enumTipoFP.ParcUnica.toString();
    else if (enumFP == eFormaPagto.ParcCartaoMaquineta)
      return this.enumTipoFP.ParcCartaoMaquineta.toString();
  }

  public zerarTodosCampos(): void {
    this.meioPagtoEntrada = null;
    this.opcaoPagtoAvista = "";
    this.meioPagtoAVista = null;
    this.opcaoPagtoParcUnica = "";
    this.meioPagtoParcUnica = null;
    this.diasVencParcUnica = null;
    this.opcaoPagtoParcComEntrada = "";
    this.meioPagtoEntradaPrest = null;
    this.diasVenc = null;
    this.opcaoPagtoParcCartaoInternet = "";
    this.opcaoPagtoParcCartaoMaquineta = "";
  }

  // montarFormasPagto() {
  //   if (this.formaPagamento != null) {

  //     this.formaPagamento.forEach(e => {
  //       if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
  //         this.formasPagtoAVista = e;
  //       }
  //       else {
  //         if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
  //           this.meiosEntrada = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_ENTRADA);
  //           this.meiosDemaisPrestacoes = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES);
  //         }
  //         if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_SEM_ENTRADA) {
  //           this.meioPrimPrest = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_PRIM_PRESTACOES);
  //           this.meiosDemaisPrestacoes = e.meios.filter(e => e.idTipoParcela == this.constantes.COD_MEIO_PAGTO_DEMAIS_PRESTACOES);
  //         }
  //         if (e.idTipoPagamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
  //           this.meioParcelaUnica = e.meios;
  //         }
  //         this.formasPagtoAPrazo.push(e);
  //       }
  //     });
  //   }
  // }

  //#endregion
}
