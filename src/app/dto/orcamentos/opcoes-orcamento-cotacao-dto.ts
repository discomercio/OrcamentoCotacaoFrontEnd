import { OrcamentoOpcaoDto } from './orcamento-opcao-dto';
import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';

export class OrcamentoCotacaoDto {
    id: number;
    vendedor: string;
    parceiro: string;
    vendedorParceiro: string;
    loja: string;
    validade: Date;
    qtdeRenovacao: number;
    concordaWhatsapp: boolean;
    observacoesGerais: string;
    entregaImediata: boolean;
    dataEntregaImediata: Date;
    tipoCliente: string;
    clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto;
    listaOrcamentoCotacaoDto: OrcamentoOpcaoDto[];
}
