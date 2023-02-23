import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Location } from '@angular/common';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SelecProdDialogComponent } from '../selec-prod-dialog/selec-prod-dialog.component';
import { SelecProdInfo } from '../selec-prod-dialog/selec-prod-info';
import { asapScheduler } from 'rxjs';
import { DadosPagtoComponent } from '../dados-pagto/dados-pagto.component';
import { NgForm } from '@angular/forms';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { ConfirmarEnderecoComponent } from '../confirmar-endereco/confirmar-endereco.component';
import { PrePedidoConfirmarClienteComponent } from '../confirmar-cliente/prepedidoconfirmar-cliente.component';
import { TestBed } from '@angular/core/testing';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { PrePedidoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrePedidoDto';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { ProdutoComboDto } from 'src/app/dto/prepedido/Produto/ProdutoComboDto';
import { ProdutoService } from 'src/app/service/produto/prepedido/produto.service';
import { ProdutoDto } from 'src/app/dto/prepedido/Produto/ProdutoDto';
import { PrepedidoProdutoDtoPrepedido } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrepedidoProdutoDtoPrepedido';
import { ConfirmationDialogComponent } from 'src/app/utilities/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-prepedidoitens',
  templateUrl: './prepedidoitens.component.html',
  styleUrls: [
    './prepedidoitens.component.scss',
    '../../../../estilos/tabelaresponsiva.scss',
    '../../../../estilos/numeros.scss'
  ]
})
export class PrePedidoItensComponent extends TelaDesktopBaseComponent implements OnInit {

  //#region dados
  //dados sendo criados
  criando = true;
  prePedidoDto: PrePedidoDto;
  //#endregion

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    private readonly router: Router,
    public readonly novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly prepedidoBuscarService: PrepedidoBuscarService,
    public readonly alertaService: AlertaService,
    public readonly produtoService: ProdutoService,
    public readonly dialog: MatDialog,
    telaDesktopService: TelaDesktopService
  ) {
    super(telaDesktopService);
  }

  carregandoDto = true;
  ngOnInit() {
    //se tem um parâmetro no link, colocamos ele no serviço
    let numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;
    if (!!numeroPrepedido) {
      //se for igual ao que está no serviço, podemos usar o que está no serviço
      this.prePedidoDto = this.novoPrepedidoDadosService.prePedidoDto;
      if (!this.prePedidoDto || this.prePedidoDto.NumeroPrePedido.toString() !== numeroPrepedido.toString()) {
        //ou não tem nada no serviço ou está diferente
        this.prepedidoBuscarService.buscar(numeroPrepedido).subscribe({
          next: (r) => {
            if (r == null) {
              this.alertaService.mostrarErroInternet(r);
              this.router.navigate(["/novoprepedido"]);
              return;
            }
            //detalhes do prepedido
            this.carregandoDto = false;
            this.prePedidoDto = r;
            this.novoPrepedidoDadosService.setar(r);
            this.criando = !this.prePedidoDto.NumeroPrePedido;
            this.inscreverPermite_RA_Status();
            this.inscreverProdutoComboDto();

          },
          error: (r) => { this.alertaService.mostrarErroInternet(r) }
        });
        return;
      }
    }

    this.prePedidoDto = this.novoPrepedidoDadosService.prePedidoDto;
    //se veio diretamente para esta tela, e não tem nada no serviço, não podemos continuar
    //então voltamos para o começo do processo!
    if (!this.prePedidoDto) {
      this.router.navigate(["/novoprepedido"]);
      return;
    }

    this.carregandoDto = false;
    this.criando = !this.prePedidoDto.NumeroPrePedido;
    this.inscreverPermite_RA_Status();
    this.inscreverProdutoComboDto();
    this.obtemPercentualVlPedidoRA();
  }

  moedaUtils: MoedaUtils = new MoedaUtils();

  cpfCnpj() {
    let ret = "CPF: ";
    if (this.prePedidoDto.DadosCliente.Tipo == new Constantes().ID_PJ) {
      ret = "CNPJ: ";
    }
    //fica melhor sem nada na frente:
    ret = "";
    return ret + CpfCnpjUtils.cnpj_cpf_formata(this.prePedidoDto.DadosCliente.Cnpj_Cpf);
  }

  permite_RA_Status = false;
  inscreverPermite_RA_Status() {
    this.prepedidoBuscarService.Obter_Permite_RA_Status().subscribe({
      next: (r) => {
        if (r != 0) {
          this.permite_RA_Status = true;
          this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus = 1;
        }
      },
      error: (r) => this.alertaService.mostrarErroInternet(r)
    });
  }

  carregandoProds = true;
  produtoComboDto: ProdutoComboDto;
  inscreverProdutoComboDto() {
    this.produtoService.listarProdutosCombo(this.prePedidoDto.DadosCliente.Loja, this.prePedidoDto.DadosCliente.Id).subscribe({
      next: (r: ProdutoComboDto) => {
        if (!!r) {
          this.produtoComboDto = r;
          this.produtoComboDto.ProdutoDto = this.produtoComboDto.ProdutoDto.filter(el => el.Preco_lista && el.Preco_lista != 0);
          this.carregandoProds = false;
          if (this.clicouAddProd)
            this.adicionarProduto();
        } else {
          this.carregandoProds = false;
          this.alertaService.mostrarMensagem("Erro ao acessar a lista de produtos: nenhum produto retornado. Por favor, entre em contato com o suporte técnico.")
        }
      },
      error: (r: ProdutoComboDto) => {
        this.carregandoProds = false;
        this.alertaService.mostrarErroInternet(r);
      }
    });
  }

  //mensagens de estoque
  estoqueItem(i: PrepedidoProdutoDtoPrepedido): ProdutoDto {
    if (!this.produtoComboDto) {
      return null;
    }

    //procuramos esse item
    const item = this.produtoComboDto.ProdutoDto.filter(el => el.Fabricante === i.Fabricante && el.Produto === i.Produto);
    if (!item || item.length <= 0) {
      return null;
    }
    //achamos o item
    return item[0];
  }

  estoqueExcedido(i: PrepedidoProdutoDtoPrepedido): boolean {
    const item = this.estoqueItem(i);
    //se nao achamos, dizemos que não tem que mostrar a mensagem não...
    if (!item) {
      return false;
    }
    if (item.Estoque < i.Qtde) {
      return true;
    }
    return false;
  }

  estoqueExistente(i: PrepedidoProdutoDtoPrepedido): number {
    //para imprimir quantos itens tem em estoque
    const item = this.estoqueItem(i);

    if (!item) {
      return null;
    }
    return item.Estoque;
  }

  public msgQtdePermitida: string = "";
  qtdeVendaPermitida(i: PrepedidoProdutoDtoPrepedido): boolean {
    //busca o item na lista
    this.msgQtdePermitida = "";

    const item = this.estoqueItem(i);
    if (!item) {
      return false;
    }

    if (i.Qtde > item.Qtde_Max_Venda) {
      this.msgQtdePermitida = "Quantidade solicitada excede a quantidade máxima de venda permitida!";
      return true;
    }
    else
      return false;

  }

  produtoTemAviso(i: PrepedidoProdutoDtoPrepedido): boolean {
    const item = this.estoqueItem(i);
    //se nao achamos, dizemos que não tem que mostrar a mensagem não...
    if (!item) {
      return false;
    }
    if (!item.Alertas || item.Alertas.trim() === "") {
      return false;
    }
    return true;
  }

  produtoMsgAviso(i: PrepedidoProdutoDtoPrepedido): string {
    const item = this.estoqueItem(i);
    if (!item) {
      return "";
    }
    return item.Alertas;
  }

  // totalPedido(): number {
  //   return this.prePedidoDto.VlTotalDestePedido = this.moedaUtils.formatarDecimal(
  //     this.prePedidoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItem), 0));

  // }

  // totalPedidoRA(): number {
  //   //afazer: calcular o total de Preco_Lista para somar apenas o total como é feito no total do pedido
  //   return this.prePedidoDto.ValorTotalDestePedidoComRA = this.moedaUtils.formatarDecimal(
  //     this.prePedidoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItemRA), 0));
  // }

  //componente de forma de pagamento, precisa do static false
  @ViewChild("dadosPagto", { static: false }) dadosPagto: DadosPagtoComponent;

  //#region digitacao de numeros

  digitouQte(i: PrepedidoProdutoDtoPrepedido) {
    if (i.Qtde <= 0) {
      i.Qtde = 1;
    }

    // let desc = 1 - i.Desc_Dado / 100;
    // i.TotalItem = this.moedaUtils.formatarDecimal((i.Preco_Lista * i.Qtde) * desc);
    i.TotalItem = this.moedaUtils.formatarDecimal(i.Preco_Venda * i.Qtde); // preco_venda = Vl Venda na tela
    this.dadosPagto.prepedidoAlterado();
    this.novoPrepedidoDadosService.totalPedido();

    if (this.prePedidoDto.PermiteRAStatus == 1) {
      i.TotalItemRA = this.moedaUtils.formatarDecimal(i.Preco_NF * i.Qtde);
      this.novoPrepedidoDadosService.totalPedidoRA();
    }
  }

  digitouPreco(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';

    //se não alteraram nada, ignoramos
    if (i.CustoFinancFornecPrecoListaBase === Number.parseFloat(v))
      return;

    i.CustoFinancFornecPrecoListaBase = Number.parseFloat(v);
    if (i.Desc_Dado) {
      i.Preco_Venda = this.moedaUtils.formatarDecimal(i.CustoFinancFornecPrecoListaBase * (1 - i.Desc_Dado / 100));
    }
    else {
      i.Preco_Venda = this.moedaUtils.formatarDecimal(i.CustoFinancFornecPrecoListaBase);
    }

    this.digitouQte(i);
  }

  digitouPreco_NF(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = Number.parseFloat((v / 100).toFixed(2) + '');

    if (Number.parseFloat(i.Preco_Lista.toFixed(2)) === v) {
      i.AlterouValorRa = false;
    }
    else {
      i.AlterouValorRa = true;
    }

    i.Preco_NF = this.moedaUtils.formatarDecimal(v);

    this.somarRA();

    this.digitouQte(i);
  }

  formatarPreco_NF(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';

    i.Preco_NF = v;
  }

  somaRA: string;
  somarRA(): string {
    let total = this.novoPrepedidoDadosService.totalPedido();
    let totalRa = this.novoPrepedidoDadosService.totalPedidoRA();
    // vou formatar  aqui antes de passar para a tela
    let valor_ra = this.moedaUtils.formatarDecimal(totalRa - total);

    if (valor_ra > 0)
      this.somaRA = this.moedaUtils.formatarMoedaSemPrefixo(valor_ra);
    else
      this.somaRA = this.moedaUtils.formatarValorDuasCasaReturnZero(valor_ra);

    return this.somaRA;
  }

  formataPreco_Venda(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';

    i.Preco_Venda = v;
  }

  digitouPreco_Venda(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    
    i.TotalItem = i.Qtde * i.Preco_Lista;
    i.VlTotalItem = i.Qtde * i.Preco_Lista;

    i.Desc_Dado = 100 * (i.Preco_Lista - v) / i.Preco_Lista;
    //calcula o desconto
    i.Desc_Dado = this.moedaUtils.formatarDecimal(i.Desc_Dado);

    if (i.Preco_Lista == i.Preco_Venda) {
      i.Alterou_Preco_Venda = false;
    } else {
      i.Alterou_Preco_Venda = true;
    }

    this.digitouQte(i);
  }

  digitouDesc(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    v = (v / 100).toFixed(2) + '';

    //se o desconto for digitado estamos alterando o valor de venda e não devemos mais alterar esse valor
    if (i.Desc_Dado == 0 || i.Desc_Dado.toString() == '') {
      i.Alterou_Preco_Venda = false;
    } else {
      i.Alterou_Preco_Venda = true;
    }

    this.digitouDescValor(i, v);
  }

  formatarDesc(e: Event, i: PrepedidoProdutoDtoPrepedido) {
    let valor = ((e.target) as HTMLInputElement).value;
    let v: any = valor.replace(/,/g, '');
    if (!isNaN(v)) {
      v = (v / 100).toFixed(2) + '';
      i.Desc_Dado = v;
    }
  }

  digitouDescValor(i: PrepedidoProdutoDtoPrepedido, v: string) {
    
    //se não alteraram nada, ignoramos
    if (i.Desc_Dado === Number.parseFloat(v)){
      if(i.Desc_Dado == 0){
        i.Desc_Dado = 0;
      }
      return;
    }
      

    i.Desc_Dado = Number.parseFloat(v);
    //não deixa números negativos e nem maior que 100
    /*
    //pensando bem, deixa negativos sim!
    é que parece que tem caso na base com desconto negativo...
    if (i.Desconto <= 0) {
      i.Desconto = 0;
    }
    */

    if (i.Desc_Dado > 100) {
      i.Desc_Dado = 100;
    }

    if (i.Desc_Dado) {
      i.Preco_Venda = i.Preco_Lista * (1 - i.Desc_Dado / 100);
      i.Preco_Venda = Number.parseFloat(i.Preco_Venda.toFixed(2));
    }
    else {
      i.Preco_Venda = i.Preco_Lista;
    }
    this.digitouQte(i);
  }
  //#endregion

  //#region navegação

  percentualVlPedidoRA: number;
  obtemPercentualVlPedidoRA() {
    this.prepedidoBuscarService.ObtemPercentualVlPedidoRA().subscribe({
      next: (r: number) => {
        if (!!r) {
          this.percentualVlPedidoRA = r;
        }
      },
      error: (r: number) => this.alertaService.mostrarErroInternet(r)
    });
  }

  voltar() {
    this.novoPrepedidoDadosService.clicadoBotaoVoltarDaTelaItens = true;

    // if(!this.dadosPagto.podeContinuar())
    // return false;
    this.dadosPagto.podeContinuar(false);
    // this.dadosPagto.atribuirFormaPagtoParaDto();
    this.location.back();
  }

  continuar() {

    //verificar se tem produtos com qtde maior que o permitido
    let q: number = 0;
    this.prePedidoDto.ListaProdutos.forEach(r => {
      //afazer: recalcular desconto antes de cadastrar
      r.Desc_Dado = 100 * (r.Preco_Lista - r.Preco_Venda) / r.Preco_Lista;

      if (this.qtdeVendaPermitida(r)) {
        q++;
      }
    });
    if (q > 0) {
      this.alertaService.mostrarMensagem("Produtos com quantidades maiores que a quantidade máxima permitida para venda!");
      return;
    }
    //validação: tem que ter algum produto
    if (this.prePedidoDto.ListaProdutos.length === 0) {
      this.alertaService.mostrarMensagem("Selecione ao menos um produto para continuar.");
      return;
    }

    if (this.prePedidoDto.PermiteRAStatus == 1) {
      if (this.percentualVlPedidoRA != 0 && this.percentualVlPedidoRA != undefined) {

        let vlAux = (this.percentualVlPedidoRA / 100) * this.novoPrepedidoDadosService.totalPedido();
        let totalRA = (this.novoPrepedidoDadosService.totalPedidoRA() - this.novoPrepedidoDadosService.totalPedido());

        if (totalRA > vlAux) {
          this.alertaService.mostrarMensagem("O valor total de RA excede o limite permitido!");
          return;
        }
      }
    }

    //verifica se a forma de pgamento tem algum aviso
    if (!this.dadosPagto.podeContinuar(true)) {
      return;
    }

    let numeroPrepedido = this.activatedRoute.snapshot.params.numeroPrepedido;
    if (!!numeroPrepedido) {
      this.router.navigate(["../../observacoes"], { relativeTo: this.activatedRoute });
    }
    else {
      this.router.navigate(["../observacoes"], { relativeTo: this.activatedRoute });
    }
  }

  adicionarProduto() {
    //ele mesmo já adiciona
    this.clicouAddProd = true;
    this.mostrarProdutos(null);
  }

  removerLinha(i: PrepedidoProdutoDtoPrepedido) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: `Remover este item do pedido?`
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.prePedidoDto.ListaProdutos = this.prePedidoDto.ListaProdutos.filter(function (value, index, arr) {
          return value !== i;
        });
        //Gabriel
        this.dadosPagto.prepedidoAlterado();
      }
    });
  }


  public clicouAddProd: boolean = false;
  verificarCargaProdutos(): boolean {
    if (this.carregandoProds) {
      //ainda não carregou, vamos esperar....
      return false;
    }
    return true;
  }

  //criaremos uma lista para armazenar os itens pelo item principal, independente se é produto composto
  public lstProdutoAdd: PrepedidoProdutoDtoPrepedido[] = [];
  mostrarProdutos(linha: PrepedidoProdutoDtoPrepedido) {

    if (!this.verificarCargaProdutos()) {
      return;
    }
    const selecProdInfo = new SelecProdInfo();
    selecProdInfo.produtoComboDto = this.produtoComboDto;
    selecProdInfo.ClicouOk = false;
    if (linha) {
      selecProdInfo.Produto = linha.Produto;
      selecProdInfo.Fabricante = linha.Fabricante;
      selecProdInfo.Qte = linha.Qtde;
    }
    let options: any = {
      autoFocus: false,
      width: "55vw",
      //não colocamos aqui para que ele ajuste melhor: height:"85vh",      
      data: selecProdInfo
    };
    if (!this.telaDesktop) {
      //opções para celular
      options = {
        autoFocus: false,
        width: "100vw", //para celular, precisamos da largura toda
        maxWidth: "100vw",
        //não colocamos aqui para que ele ajuste melhor: height:"85vh",
        data: selecProdInfo
      };
    }


    const dialogRef = this.dialog.open(SelecProdDialogComponent, options);
    dialogRef.afterClosed().subscribe((result) => {
      if (result && selecProdInfo.ClicouOk) {
        //vamos editar ou adicionar um novo
        if (linha) {
          //editando
          //se mudou o produto, temos que mdar vários campos
          if (linha.Produto !== selecProdInfo.Produto || linha.Fabricante !== selecProdInfo.Fabricante) {
            //mudou o produto, temos que mudar muita coisa!
            const filhosDiretos = this.filhosDeProdutoComposto(selecProdInfo);
            if (!filhosDiretos) {
              //não é produto composto
              this.atualizarProduto(linha, selecProdInfo.Fabricante, selecProdInfo.Produto, selecProdInfo.Qte);
            }
            else {
              //produto composto
              //removemos o item atual e colocamostodos os novos
              this.prePedidoDto.ListaProdutos = this.prePedidoDto.ListaProdutos.filter(el => el != linha);

              //colcoamos todos os novos
              for (let i = 0; i < filhosDiretos.length; i++) {
                let novo = new PrepedidoProdutoDtoPrepedido();
                this.prePedidoDto.ListaProdutos.push(novo);
                this.atualizarProduto(novo, filhosDiretos[i].Fabricante, filhosDiretos[i].Produto, selecProdInfo.Qte * filhosDiretos[i].Qtde);
              }

            }
          }
          else {
            //o produto ficou o mesmo, só atualizamos, menos bagunça
            this.atualizarProduto(linha, selecProdInfo.Fabricante, selecProdInfo.Produto, selecProdInfo.Qte);
          }
        }
        else {
          let filhosDiretosNovo = this.filhosDeProdutoComposto(selecProdInfo);

          let itemrepetido = new Array();
          if (filhosDiretosNovo != null) {
            //pegamos 2 item se for repetido
            this.prePedidoDto.ListaProdutos.forEach(x => {
              filhosDiretosNovo.forEach(y => {
                if (y.Produto == x.Produto)
                  itemrepetido.push(y);
              })
            });
            //se a lista de produtos estiver com 11 itens, não iremos add um produto composto
            //mostraremos uma msg que este item é composto por 2 ou mais itens
            if (this.prePedidoDto.ListaProdutos.length == 11 && itemrepetido.length == 0) {
              this.alertaService.mostrarMensagem("É permitido apenas 12 itens por Pedido!\n" +
                "O produto " + selecProdInfo.Produto + " é composto por " + filhosDiretosNovo.length + " itens!");
              return false;
            }
          }
          else {
            //pegamos 1 item se for repetido
            itemrepetido = this.prePedidoDto.ListaProdutos.filter(y => y.Produto == selecProdInfo.Produto);
          }
          if (this.prePedidoDto.ListaProdutos.length >= 12 && itemrepetido.length == 0) {
            this.alertaService.mostrarMensagem("É permitido apenas 12 itens por Pedido!");
            return false;
          }
          else {
            if (!filhosDiretosNovo) {
              //não é produto composto
              let novo = new PrepedidoProdutoDtoPrepedido();
              this.prePedidoDto.ListaProdutos.push(novo);
              this.atualizarProduto(novo, selecProdInfo.Fabricante, selecProdInfo.Produto, selecProdInfo.Qte);

              //vamos arrumar eventuais produtos repetidos
              this.arrumarProdsRepetidos();
            }
            else {
              if ((this.prePedidoDto.ListaProdutos.length + filhosDiretosNovo.length - itemrepetido.length) <= 12) {
                //produto composto
                for (let i = 0; i < filhosDiretosNovo.length; i++) {
                  if (this.prePedidoDto.ListaProdutos.length < 12 || itemrepetido.length >= 1) {
                    /**
                     * qtos itens tem na tla + qto itens vai entrar na tela e qtos itens repedidos
                     */
                    // if (itemrepetido[i].Produto == filhosDiretosNovo[i].Produto) {
                    let novo = new PrepedidoProdutoDtoPrepedido();
                    this.prePedidoDto.ListaProdutos.push(novo);
                    this.atualizarProduto(novo, filhosDiretosNovo[i].Fabricante, filhosDiretosNovo[i].Produto,
                      selecProdInfo.Qte * filhosDiretosNovo[i].Qtde);

                    //vamos arrumar eventuais produtos repetidos
                    this.arrumarProdsRepetidos();
                    // }
                  }

                  // }
                }
              }
              else {
                this.alertaService.mostrarMensagem("É permitido apenas 12 itens por Pedido!");
                return false;
              }
            }
          }
        }
      }
    });
  }

  //depois de selecionar o produto, atualiza todos os campos
  atualizarProduto(linha: PrepedidoProdutoDtoPrepedido, fabricante: string, produto: string, qtde: number) {
    let prodInfo = this.produtoComboDto.ProdutoDto.filter(el => el.Fabricante === fabricante && el.Produto === produto)[0];

    if (!prodInfo) {
      prodInfo = new ProdutoDto();
    }
    linha.Fabricante = fabricante;
    linha.Produto = produto;
    linha.Descricao = prodInfo.Descricao_html;
    //Obs: string;
    linha.Qtde = qtde;
    //Permite_Ra_Status: number;
    //BlnTemRa: boolean;
    linha.CustoFinancFornecPrecoListaBase = prodInfo.Preco_lista;
    linha.Preco_Lista = prodInfo.Preco_lista;
    linha.Preco_Venda = prodInfo.Preco_lista;
    linha.Preco_NF = prodInfo.Preco_lista;

    if (!linha.Desc_Dado) {
      linha.Desc_Dado = 0;
    }
    this.digitouDescValor(linha, linha.Desc_Dado.toString());
    this.digitouQte(linha);
  }

  filhosDeProdutoComposto(selecProdInfo: SelecProdInfo) {

    const registros = this.produtoComboDto.ProdutoCompostoDto.filter(el => el.PaiFabricante === selecProdInfo.Fabricante && el.PaiProduto === selecProdInfo.Produto);

    if (!registros) {
      return null;
    }
    if (registros.length <= 0) {
      return null;
    }
    return registros[0].Filhos;
  }

  buscarPaideFilho(item: string) {
    let pai = "";
    const registro = this.produtoComboDto.ProdutoCompostoDto.filter(x => x.Filhos.filter(y => y.Produto == item));
    if (!registro) {
      registro.forEach(x => {
        x.Filhos.forEach(y => {
          if (y.Produto == item) {
            pai = x.PaiProduto;
          }
        })
      })
    }

    return pai;
  }

  //consolidamos produtos repetidos
  arrumarProdsRepetidos() {
    let lp = this.prePedidoDto.ListaProdutos;
    for (let i = 0; i < lp.length; i++) {
      let este = lp[i];

      //se tiver algum repetido, tiramos o proximo repetido
      let continaurBuscaRepetido = true;
      while (continaurBuscaRepetido) {
        continaurBuscaRepetido = false;
        for (let irepetido = i + 1; irepetido < lp.length; irepetido++) {
          let repetido = lp[irepetido];
          if (este.Fabricante === repetido.Fabricante && este.Produto == repetido.Produto) {
            //repetido, tem que tirar este!
            continaurBuscaRepetido = true;
            este.Qtde += repetido.Qtde;
            this.prePedidoDto.ListaProdutos = this.prePedidoDto.ListaProdutos.filter(el => el !== repetido);
            lp = this.prePedidoDto.ListaProdutos;
            this.digitouQte(este);
          }
        }
      }
    }
  }
  //#endregion

}
