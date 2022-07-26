import { PrepedidoProdutoDtoPrepedido } from './PrepedidoProdutoDtoPrepedido';
import { DetalhesDtoPrepedido } from './DetalhesDtoPrepedido';
import { FormaPagtoCriacaoDto } from './FormaPagtoCriacaoDto';
import { DadosClienteCadastroDto } from '../../clientes/DadosClienteCadastroDto';
import { EnderecoEntregaDtoClienteCadastro } from '../../clientes/EnderecoEntregaDTOClienteCadastro';
import { EnderecoCadastralClientePrepedidoDto } from '../EnderecoCadastralClientePrepedidoDto';

export class PrePedidoDto {
    constructor(){
        this.DadosCliente = new DadosClienteCadastroDto();
        this.EnderecoEntrega = new EnderecoEntregaDtoClienteCadastro();
        this.EnderecoCadastroClientePrepedido = new EnderecoCadastralClientePrepedidoDto();
        this.FormaPagtoCriacao = new FormaPagtoCriacaoDto();
    }

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
    ListaProdutos: PrepedidoProdutoDtoPrepedido[] = [];
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
