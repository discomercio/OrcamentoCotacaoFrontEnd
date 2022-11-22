import { DadosPagtoComponent } from './dados-pagto.component';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';
import { ProdutosCalculados } from './tipo-forma-pagto';
import { getMatTooltipInvalidPositionError } from '@angular/material';
import { ProdutoTela } from '../selec-prod-dialog/produto-tela';
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CoeficienteDto } from 'src/app/dto/prepedido/Produto/CoeficienteDto';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';
import { PrepedidoProdutoDtoPrepedido } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrepedidoProdutoDtoPrepedido';


export class RecalcularComCoeficiente {

  constructor(public readonly prepedidoBuscarService: PrepedidoBuscarService,
    public readonly novoPrepedidoDadosService: NovoPrepedidoDadosService,
    public readonly alertaService: AlertaService) { }

  dadosPagto: DadosPagtoComponent;
  lstCoeficientesFornecdores: any[] = new Array();


  buscarCoeficienteFornecedores(callback: (coefciente: CoeficienteDto[][]) => void): void {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    let fornecedores: string[] = new Array();

    this.novoPrepedidoDadosService.prePedidoDto.ListaProdutos.forEach(element => {
      fornecedores.push(element.Fabricante);
    });

    let fornecDistinct = fornecedores.filter(distinct);

    let f: string[] = new Array();

    this.prepedidoBuscarService.buscarCoeficienteFornecedores(fornecDistinct).subscribe({
      next: (r: any[]) => {
        if (!!r) {
          callback(r);
        }
        else {
          this.alertaService.mostrarMensagem("Erro ao carregar a lista de coeficientes dos fabricantes")
        }
      },
      error: (r: CoeficienteDto) => this.alertaService.mostrarErroInternet(r)
    });

  }
  constantes = new Constantes();
  lstProdutosCalculados: ProdutosCalculados[];
  ProdutosCalculados: ProdutosCalculados;
  CalcularTotalProdutosComCoeficiente(enumFP: number, coeficienteDtoNovo: CoeficienteDto[][],
    tipoFormaPagto: string, qtdeParcVisa: number, vlEntrada: number): string[] {

    this.lstProdutosCalculados = new Array();
    this.ProdutosCalculados = new ProdutosCalculados();
    let lstMsg: string[] = new Array();
    let lstCoeficiente = coeficienteDtoNovo;
    let lstProdutos = this.novoPrepedidoDadosService.prePedidoDto.ListaProdutos;
    let alterouValorRA: boolean = false;
    let totalProduto = 0;
    let coeficienteFornec: CoeficienteDto[];

    //vamos calcular os produtos com os respectivos coeficientes e atribuir a uma variavel de total do prepedido
    let cont = 0;
    if (lstProdutos.length > 0) {
      lstCoeficiente.forEach(element => {
        lstProdutos.forEach(p => {

          if (!!tipoFormaPagto && !!enumFP) {

            //A vista
            if (tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__A_VISTA &&
              enumFP.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA) {
              coeficienteFornec = element.filter(x => x.Fabricante == p.Fabricante);
              if (!!coeficienteFornec[0]) {
                if (coeficienteFornec[0].Fabricante == p.Fabricante) {
                  this.calcularTotalProdutoAvistaParcelamento(p);
                }
              }
            }

            //Parcela única
            if (tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA &&
              enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
              totalProduto = (p.CustoFinancFornecPrecoListaBase * p.Qtde) * (1 - p.Desc_Dado / 100);

              coeficienteFornec = element.filter(x => x.Fabricante == p.Fabricante &&
                x.TipoParcela == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA &&
                x.QtdeParcelas == 1);

              if (!!coeficienteFornec[0]) {
                if (coeficienteFornec[0].Fabricante == p.Fabricante) {
                  //chamar aqui o novo metodo
                  this.calcularTotalProduto_ParcelaUnica(p, coeficienteFornec[0]);
                }
              }
            }

            if (tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA &&
              enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {

              if (!!vlEntrada && vlEntrada != 0.00) {

                this.vlEntrada = vlEntrada;

                totalProduto = (p.CustoFinancFornecPrecoListaBase * p.Qtde) * (1 - p.Desc_Dado / 100);

                coeficienteFornec = element.filter(x => x.Fabricante == p.Fabricante &&
                  x.TipoParcela == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA);

                coeficienteFornec.forEach(x => {
                  //chamar novo metodo aqui
                  this.calcularTotalProduto_Parcela_Com_Entrada(p, x);
                });
              }
            }

            //cartão internet e maquineta
            if (tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA &&
              (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO ||
                enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA)) {

              coeficienteFornec = element.filter(x => x.Fabricante == p.Fabricante &&
                x.TipoParcela == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA);

              coeficienteFornec.forEach(x => {
                //chamar metodo nov aqui
                this.calcularTotalProduto_Cartao_Maquineta_Parcelamento(p, x);
              });
            }
          }

        })
        //vamos verificar se é avista para sair do foreach do coeficiente que não é utilizado para este tipo
        if (!!enumFP)
          if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA ||
            enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA) {
            return false;
          }

      })
    }
    else {
      this.alertaService.mostrarMensagem("Favor selecionar um Produto!");
      return;
    }
    //precisamos retornar a lista de string para mostrar no Parcelamento
    lstMsg = this.CalcularTotalOrcamento(qtdeParcVisa, enumFP);

    return lstMsg;
  }

  //valor de entrada
  vlEntrada: number;
  moedaUtils = new MoedaUtils();
  //monta a lista de parcelamento
  CalcularTotalOrcamento(qtdeParcVisa: number, enumFP: number): string[] {
    let lstMsg: string[] = new Array();
    if (!!enumFP) {
      if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA) {

        let filtrarParcela = this.lstProdutosCalculados.filter(x => x.QtdeParcela == 1);
        let valorTotalParc = filtrarParcela.reduce((sum, prod) => sum + prod.Valor, 0);
        lstMsg.push(this.moedaUtils.formatarMoedaComPrefixo(valorTotalParc));
        // "1 X " +
      }
      else {
        if (!!qtdeParcVisa) {

          for (let i = 0; i <= qtdeParcVisa; i++) {
            let filtrarParcela = this.lstProdutosCalculados.filter(x => x.QtdeParcela == i);

            let valorTotalParc = filtrarParcela.reduce((sum, prod) => sum + this.moedaUtils.formatarDecimal(prod.Valor), 0);

            if (!!valorTotalParc) {
              if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA) {
                //vamos testar para saber se parcela com entrada
                if (!!this.vlEntrada) {
                  if (this.vlEntrada > valorTotalParc) {
                    this.alertaService.mostrarMensagem("Valor da entrada é maior que o total do Pedido!");
                    this.vlEntrada = null;
                    lstMsg = new Array();
                    return;
                  }
                  else {
                    valorTotalParc = this.moedaUtils.formatarDecimal(valorTotalParc - this.vlEntrada);
                  }
                }
              }

              lstMsg.push(i + " X " +
                this.moedaUtils.formatarMoedaComPrefixo(valorTotalParc / i));
            }
          }
        }
      }
    }
    return lstMsg;
  }

  //alterar os valores dos produtos que estão no serviço
  RecalcularListaProdutos(enumFP: number, coeficienteDtoNovo: CoeficienteDto[][],
    tipoFormaPagto: string, qtdeParc: number): void {

    let coeficiente: CoeficienteDto[];
    let permiteRAStatus: number = this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus;

    //Aqui iremos verificar se
    if (!!enumFP) {
      if (this.novoPrepedidoDadosService.prePedidoDto.ListaProdutos.length > 0) {
        coeficienteDtoNovo.forEach(coef => {

          //vamos alterar diretamente no serviço
          this.novoPrepedidoDadosService.prePedidoDto.ListaProdutos.forEach(produto => {

            //vamos verificar se é pagto á vista
            if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_A_VISTA &&
              tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__A_VISTA) {

              if (produto.Alterou_Preco_Venda) {
                //devemos alterar o valor de desconto
                //valor com coeficiente - valor venda * 100 / valor com coeficiente
                produto.Desc_Dado = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase - produto.Preco_Venda) * 100 / produto.CustoFinancFornecPrecoListaBase);
                produto.Preco_Lista = this.moedaUtils.formatarDecimal(produto.CustoFinancFornecPrecoListaBase);//só altera se calcular coeficiente
                produto.TotalItem = this.moedaUtils.formatarDecimal((produto.Preco_Venda * produto.Qtde));
                produto.VlTotalItem = this.moedaUtils.formatarDecimal((produto.Preco_Venda * produto.Qtde));
                produto.CustoFinancFornecCoeficiente = 1;

              } else {
                produto.Preco_Venda = this.moedaUtils.formatarDecimal(produto.CustoFinancFornecPrecoListaBase);
                produto.VlTotalItem = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * produto.Qtde));
                produto.Preco_Lista = this.moedaUtils.formatarDecimal(produto.CustoFinancFornecPrecoListaBase);//só altera se calcular coeficiente
                produto.TotalItem = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * produto.Qtde));
                produto.CustoFinancFornecCoeficiente = 1;
              }
              if (!produto.AlterouValorRa || produto.AlterouValorRa == undefined) {
                produto.Preco_NF = permiteRAStatus == 0 ? produto.Preco_Venda : this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase));
                produto.TotalItemRA = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * produto.Qtde));
                produto.CustoFinancFornecCoeficiente = 1;
              }
            }

            //vamos testar se é pagto parcela única
            if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA &&
              tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA) {

              //vamos filtrar o coeficiente
              coeficiente = coef.filter(x => x.Fabricante == produto.Fabricante &&
                x.TipoParcela == tipoFormaPagto && x.QtdeParcelas == qtdeParc);

              coeficiente.forEach(x => {
                if (produto.Alterou_Preco_Venda) {

                  produto.Desc_Dado = this.moedaUtils.formatarDecimal(((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente) - produto.Preco_Venda) * 100 /
                    (produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  let desc = 1 - produto.Desc_Dado / 100;
                  produto.TotalItem = this.moedaUtils.formatarDecimal((produto.Preco_Lista * produto.Qtde) * desc);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                else {
                  produto.Preco_Venda = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.VlTotalItem = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  produto.TotalItem = this.moedaUtils.formatarDecimal(produto.Preco_Venda * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                if (!produto.AlterouValorRa || produto.AlterouValorRa == undefined) {
                  produto.Preco_NF = permiteRAStatus == 0 ? produto.Preco_Venda : this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  let total_com_coeficiente = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.TotalItemRA = this.moedaUtils.formatarDecimal(total_com_coeficiente * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }

              });
            }

            //vamos testar se é pagto com entrada 
            if (enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA &&
              tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__COM_ENTRADA) {

              coeficiente = coef.filter(x => x.Fabricante == produto.Fabricante &&
                x.TipoParcela == tipoFormaPagto && x.QtdeParcelas == qtdeParc);

              coeficiente.forEach(x => {
                if (produto.Alterou_Preco_Venda) {
                  produto.Desc_Dado = this.moedaUtils.formatarDecimal(((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente) - produto.Preco_Venda) * 100 /
                    (produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  let desc = 1 - produto.Desc_Dado / 100;
                  produto.TotalItem = this.moedaUtils.formatarDecimal((produto.Preco_Lista * produto.Qtde) * desc);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                else {
                  produto.Preco_Venda = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.VlTotalItem = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  produto.TotalItem = this.moedaUtils.formatarDecimal(produto.Preco_Venda * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                if (!produto.AlterouValorRa || produto.AlterouValorRa == undefined) {
                  produto.Preco_NF = permiteRAStatus == 0 ? produto.Preco_Venda : this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.TotalItemRA = this.moedaUtils.formatarDecimal(produto.Preco_NF * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }

              });
            }

            //vamos testar se é pagto com Cartão e Maquininha
            if ((enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO ||
              enumFP.toString() == this.constantes.COD_FORMA_PAGTO_PARCELADO_CARTAO_MAQUINETA) &&
              tipoFormaPagto == this.constantes.COD_CUSTO_FINANC_FORNEC_TIPO_PARCELAMENTO__SEM_ENTRADA) {

              coeficiente = coef.filter(x => x.Fabricante == produto.Fabricante &&
                x.TipoParcela == tipoFormaPagto && x.QtdeParcelas == qtdeParc);

              coeficiente.forEach(x => {

                if (produto.Alterou_Preco_Venda) {

                  produto.Desc_Dado = this.moedaUtils.formatarDecimal(((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente) - produto.Preco_Venda) * 100 /
                    (produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  let desc = 1 - produto.Desc_Dado / 100;
                  produto.TotalItem = this.moedaUtils.formatarDecimal((produto.Preco_Lista * produto.Qtde) * desc);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                else {
                  produto.Preco_Venda = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.VlTotalItem = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.Preco_Lista = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));//só altera se calcular coeficiente
                  let total_com_coeficiente = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.TotalItem = this.moedaUtils.formatarDecimal(total_com_coeficiente * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }
                if (!produto.AlterouValorRa || produto.AlterouValorRa == undefined) { 
                  produto.Preco_NF = permiteRAStatus == 0 ? produto.Preco_Venda : this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  let total_com_coeficiente = this.moedaUtils.formatarDecimal((produto.CustoFinancFornecPrecoListaBase * x.Coeficiente));
                  produto.TotalItemRA = this.moedaUtils.formatarDecimal(total_com_coeficiente * produto.Qtde);
                  produto.CustoFinancFornecCoeficiente = x.Coeficiente;
                }

              });
            }
          });
        });
      }
    }
  }

  //calculo para montar a lista que vai no parcelamento a vista
  calcularTotalProdutoAvistaParcelamento(p: PrepedidoProdutoDtoPrepedido): void {
    let preco_venda: number = 0;
    let desconto: number = 0;
    let precoBase: number = 0;
    let total_com_coeficiente: number = 0;
    this.ProdutosCalculados = new ProdutosCalculados();

    if (!!this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus &&
      this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus == 1) {
      if (p.AlterouValorRa && p.AlterouValorRa != undefined) {
        p.VlTotalItem = this.moedaUtils.formatarDecimal(p.Preco_NF * p.Qtde);
      }
      else {
        p.VlTotalItem = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * p.Qtde);
      }
    }
    else {
      if (p.Alterou_Preco_Venda) {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * 1);
        preco_venda = this.moedaUtils.formatarDecimal(Number(p.Preco_Venda));
        p.VlTotalItem = this.moedaUtils.formatarDecimal(preco_venda * p.Qtde);
      }
      else {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * 1);
        p.VlTotalItem = this.moedaUtils.formatarDecimal(precoBase * p.Qtde);
      }
    }

    this.ProdutosCalculados.QtdeParcela = 1;
    this.ProdutosCalculados.Valor = p.VlTotalItem;
    this.lstProdutosCalculados.push(this.ProdutosCalculados);
  }

  //calculo para montar a lista que vai no parcelamento cartão e maquineta
  calcularTotalProduto_Cartao_Maquineta_Parcelamento(p: PrepedidoProdutoDtoPrepedido, x: CoeficienteDto): void {

    this.ProdutosCalculados = new ProdutosCalculados();
    let preco_venda: number = 0;
    let desconto: number = 0;
    let precoBase: number = 0;
    let total_com_coeficiente: number = 0;

    if (!!this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus &&
      this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus == 1) {
      if (p.AlterouValorRa && p.AlterouValorRa != undefined) {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.Preco_NF);
      }
      else {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
      }

      p.VlTotalItem = this.moedaUtils.formatarDecimal(total_com_coeficiente * p.Qtde);
    }
    else {
      if (p.Alterou_Preco_Venda) {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        preco_venda = this.moedaUtils.formatarDecimal(Number(p.Preco_Venda));
        p.VlTotalItem = this.moedaUtils.formatarDecimal(preco_venda * p.Qtde);
      } else {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        p.VlTotalItem = this.moedaUtils.formatarDecimal(precoBase * p.Qtde);
      }

    }
    this.ProdutosCalculados.QtdeParcela = x.QtdeParcelas;
    this.ProdutosCalculados.Valor = p.VlTotalItem;
    this.lstProdutosCalculados.push(this.ProdutosCalculados);

  }

  //calculo para montar a lista que vai no parcelamento de parcela única
  calcularTotalProduto_ParcelaUnica(p: PrepedidoProdutoDtoPrepedido, x: CoeficienteDto): void {

    let preco_venda: number = 0;
    let desconto: number = 0;
    let precoBase: number = 0;
    this.ProdutosCalculados = new ProdutosCalculados();

    let total_com_coeficiente: number = 0;

    if (!!this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus &&
      this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus == 1) {
      if (p.AlterouValorRa && p.AlterouValorRa != undefined) {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.Preco_NF);
      }
      else {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
      }

      p.VlTotalItem = this.moedaUtils.formatarDecimal(total_com_coeficiente * p.Qtde);
    }
    else {
      if (p.Alterou_Preco_Venda) {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        preco_venda = this.moedaUtils.formatarDecimal(Number(p.Preco_Venda));
        p.VlTotalItem = this.moedaUtils.formatarDecimal(total_com_coeficiente * p.Qtde);
      }
      else {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        p.VlTotalItem = this.moedaUtils.formatarDecimal(precoBase * p.Qtde);
      }
    }
    this.ProdutosCalculados.QtdeParcela = x.QtdeParcelas;
    this.ProdutosCalculados.Valor = p.VlTotalItem;
    this.lstProdutosCalculados.push(this.ProdutosCalculados);
  }

  //calculo para montar a lista que vai no parcelamento com entrada
  calcularTotalProduto_Parcela_Com_Entrada(p: PrepedidoProdutoDtoPrepedido, x: CoeficienteDto): void {
    this.ProdutosCalculados = new ProdutosCalculados();
    let preco_venda: number = 0;
    let desconto: number = 0;
    let precoBase: number = 0;
    let total_com_coeficiente: number = 0;

    if (!!this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus &&
      this.novoPrepedidoDadosService.prePedidoDto.PermiteRAStatus == 1) {

      if (p.AlterouValorRa && p.AlterouValorRa != undefined) {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.Preco_NF);
      }
      else {
        total_com_coeficiente = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
      }

      p.VlTotalItem = this.moedaUtils.formatarDecimal(total_com_coeficiente * p.Qtde);
    }
    else {
      if (p.Alterou_Preco_Venda) {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        preco_venda = this.moedaUtils.formatarDecimal(Number(p.Preco_Venda));
        p.VlTotalItem = this.moedaUtils.formatarDecimal(preco_venda * p.Qtde);
      }
      else {
        precoBase = this.moedaUtils.formatarDecimal(p.CustoFinancFornecPrecoListaBase * x.Coeficiente);
        p.VlTotalItem = this.moedaUtils.formatarDecimal(precoBase * p.Qtde);
      }
    }
    this.ProdutosCalculados.QtdeParcela = x.QtdeParcelas;
    this.ProdutosCalculados.Valor = p.VlTotalItem;
    this.lstProdutosCalculados.push(this.ProdutosCalculados);
  }
}