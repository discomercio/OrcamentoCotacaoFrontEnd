import { StatusPedidoDtoPedido } from './StatusPedidoDtoPedido';

import { PedidoProdutosDtoPedido } from './PedidoProdutosDtoPedido';
import { DetalhesNFPedidoDtoPedido } from './DetalhesNFPedidoDtoPedido';
import { DetalhesFormaPagamentos } from './DetalhesFormaPagamentos';
import { ProdutoDevolvidoDtoPedido } from './ProdutoDevolvidoDTOPedido';
import { PedidoPerdasDtoPedido } from './PedidoPerdasDtoPedido';
import { OcorrenciasDtoPedido } from './OcorrenciasDtoPedido';
import { BlocoNotasDtoPedido } from './BlocoNotasDtoPedido';
import { BlocoNotasDevolucaoMercadoriasDtoPedido } from './BlocoNotasDevolucaoMercadoriasDtoPedido';
import { EnderecoEntregaDtoClienteCadastro } from '../../prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { DadosClienteCadastroDto } from '../../prepedido/ClienteCadastro/DadosClienteCadastroDto';



export class PedidoDto {
    NumeroPedido: string;
    Lista_NumeroPedidoFilhote:Array<string[]>;
    StatusHoraPedido: StatusPedidoDtoPedido;
    DataHoraPedido: Date | string | null;
    EnderecoEntrega: EnderecoEntregaDtoClienteCadastro;
    DadosCliente: DadosClienteCadastroDto;
    ListaProdutos: PedidoProdutosDtoPedido[];
    TotalFamiliaParcelaRA: number;
    PermiteRAStatus: number;
    OpcaoPossuiRA: string;
    PercRT: number | null;
    ValorTotalDestePedidoComRA: number | null;
    VlTotalDestePedido: number | null;
    DetalhesNF: DetalhesNFPedidoDtoPedido;
    DetalhesFormaPagto: DetalhesFormaPagamentos;
    ListaProdutoDevolvido: ProdutoDevolvidoDtoPedido[];
    ListaPerdas: PedidoPerdasDtoPedido[];
    ListaOcorrencia: OcorrenciasDtoPedido[];
    ListaBlocoNotas: BlocoNotasDtoPedido[];
    ListaBlocoNotasDevolucao: BlocoNotasDevolucaoMercadoriasDtoPedido[];
}
