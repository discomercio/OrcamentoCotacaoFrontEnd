import { EnderecoEntregaDtoClienteCadastro } from '../../prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { DadosClienteCadastroDto } from '../../prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { BlocoNotasDevolucaoMercadoriasDtoPedido } from '../../prepedido/pedido/DetalhesPedido/BlocoNotasDevolucaoMercadoriasDtoPedido';
import { StatusPedidoDtoPedido } from '../../prepedido/pedido/DetalhesPedido/StatusPedidoDtoPedido';
import { PedidoProdutosDtoPedido } from '../../prepedido/pedido/DetalhesPedido/PedidoProdutosDtoPedido';
import { DetalhesNFPedidoDtoPedido } from '../../prepedido/pedido/DetalhesPedido/DetalhesNFPedidoDtoPedido';
import { DetalhesFormaPagamentos } from '../../prepedido/pedido/DetalhesPedido/DetalhesFormaPagamentos';
import { ProdutoDevolvidoDtoPedido } from '../../prepedido/pedido/DetalhesPedido/ProdutoDevolvidoDTOPedido';
import { PedidoPerdasDtoPedido } from '../../prepedido/pedido/DetalhesPedido/PedidoPerdasDtoPedido';
import { OcorrenciasDtoPedido } from '../../prepedido/pedido/DetalhesPedido/OcorrenciasDtoPedido';
import { BlocoNotasDtoPedido } from '../../prepedido/pedido/DetalhesPedido/BlocoNotasDtoPedido';



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
