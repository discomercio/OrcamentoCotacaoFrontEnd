import { PrepedidoProdutoDtoPrepedido } from './PrepedidoProdutoDtoPrepedido';
import { DetalhesDtoPrepedido } from './DetalhesDtoPrepedido';

import { EnderecoCadastralClientePrepedidoDto } from '../EnderecoCadastralClientePrepedidoDto';
import { DadosClienteCadastroDto } from '../../ClienteCadastro/DadosClienteCadastroDto';
import { EnderecoEntregaDtoClienteCadastro } from '../../ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { FormaPagtoCriacaoDto } from './FormaPagtoCriacaoDto';

export class PrePedidoDto {
    CorHeader:string;
    TextoHeader:string;
    CanceladoData:string;
    NumeroPrePedido: string;    
    //StatusHoraPedido: StatusPedidoDtoPedido;//Verificar se todos pedidos marcam a data também
    DataHoraPedido: string;
    Hora_Prepedido:string;
    prepedidoDto:string;
    DadosCliente: DadosClienteCadastroDto;
    EnderecoCadastroClientePrepedido: EnderecoCadastralClientePrepedidoDto;
    EnderecoEntrega: EnderecoEntregaDtoClienteCadastro | null;
    ListaProdutos: PrepedidoProdutoDtoPrepedido[];
    TotalFamiliaParcelaRA: number;
    PermiteRAStatus: number;
    OpcaoPossuiRA: string;
    CorTotalFamiliaRA: string;
    PercRT: number | null;
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;
    DetalhesPrepedido: DetalhesDtoPrepedido;
    FormaPagto: string[];
    FormaPagtoCriacao: FormaPagtoCriacaoDto;
    St_Orc_Virou_Pedido: boolean;//se virou pedido retornar esse campo
    NumeroPedido: string;//se virou pedido retornar esse campo    
}
