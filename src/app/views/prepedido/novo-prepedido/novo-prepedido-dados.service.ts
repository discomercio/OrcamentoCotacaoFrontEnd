import { Injectable } from '@angular/core';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { DetalhesDtoPrepedido } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/DetalhesDtoPrepedido';
import { FormaPagtoCriacaoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/FormaPagtoCriacaoDto';
import { PrePedidoDto } from 'src/app/dto/prepedido/prepedido/DetalhesPrepedido/PrePedidoDto';
import { EnderecoCadastralClientePrepedidoDto } from 'src/app/dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { MoedaUtils } from 'src/app/utilities/formatarString/moeda-utils';

@Injectable({
  providedIn: 'root'
})

export class NovoPrepedidoDadosService {

  //esta classe mantém o PrePedidoDto sendo criado
  //gaurdamos em um serviço para manter os dados

  public prePedidoDto: PrePedidoDto = null;
  constructor() { }

  public setar(prePedidoDto: PrePedidoDto) {

    this.prePedidoDto = prePedidoDto;
  }

  //somente setar dados do cliente
  public setarDTosParciais(clienteCadastroDto: DadosClienteCadastroDto,
    enderecoEntregaDtoClienteCadastro: EnderecoEntregaDtoClienteCadastro,
    endCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto) {
    let p = this.prePedidoDto;
    p.DadosCliente = clienteCadastroDto;
    p.EnderecoEntrega = enderecoEntregaDtoClienteCadastro;
    p.EnderecoCadastroClientePrepedido = endCadastralClientePrepedidoDto;
  }

  public criarNovo(clienteCadastroDto: DadosClienteCadastroDto,
    enderecoEntregaDtoClienteCadastro: EnderecoEntregaDtoClienteCadastro,
    endCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto) {
    this.prePedidoDto = new PrePedidoDto();
    let p = this.prePedidoDto;
    //temos que criar os objetos...
    p.NumeroPrePedido = "";
    p.DataHoraPedido = "";
    p.DadosCliente = clienteCadastroDto;
    p.EnderecoCadastroClientePrepedido = endCadastralClientePrepedidoDto;
    p.EnderecoEntrega = enderecoEntregaDtoClienteCadastro;
    p.ListaProdutos = new Array();
    p.TotalFamiliaParcelaRA = 0;
    p.PermiteRAStatus = 0;
    p.OpcaoPossuiRA = "";
    p.CorTotalFamiliaRA = "";
    p.PercRT = null;
    p.ValorTotalDestePedidoComRA = null;
    p.VlTotalDestePedido = null;
    p.DetalhesPrepedido = new DetalhesDtoPrepedido();
    p.FormaPagto = new Array();
    p.St_Orc_Virou_Pedido = false;
    p.NumeroPedido = "";
    p.FormaPagtoCriacao = new FormaPagtoCriacaoDto();
  }


  public moedaUtils: MoedaUtils = new MoedaUtils();
  public totalPedido(): number {
    return this.prePedidoDto.VlTotalDestePedido = this.moedaUtils.formatarDecimal(
      this.prePedidoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItem), 0));

  }

  public totalPedidoRA(): number {
    //afazer: calcular o total de Preco_Lista para somar apenas o total como é feito no total do pedido
    return this.prePedidoDto.ValorTotalDestePedidoComRA = this.moedaUtils.formatarDecimal(
      this.prePedidoDto.ListaProdutos.reduce((sum, current) => sum + this.moedaUtils.formatarDecimal(current.TotalItemRA), 0));
  }

  //inidca se clicaou no botão Voltar da tela de itens; se estiver no celular,
  //precisa voltar para a segunda tela 9a tela do endereço de entrega
  public clicadoBotaoVoltarDaTelaItens: boolean = false;

  public idMeioPagtoMonitorado: string;
  public validaEmailBoleto:boolean;
}

