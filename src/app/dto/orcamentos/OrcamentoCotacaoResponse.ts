import { ClienteOrcamentoCotacaoDto } from "../clientes/cliente-orcamento-cotacao-dto";
import { OrcamentosOpcaoResponse } from "./OrcamentosOpcaoResponse";

export class OrcamentoCotacaoResponse {
    id: number;
    vendedor: string;
    parceiro: string;
    vendedorParceiro: string;
    loja: string;
    validade: Date;
    qtdeRenovacao: number;
    concordaWhatsapp: boolean;
    observacoesGerais: string;
    entregaImediata: boolean = true;
    dataEntregaImediata: Date;
    clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto;
    listaOrcamentoCotacaoDto: OrcamentosOpcaoResponse[];
}
