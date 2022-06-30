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
    entregaImediata: boolean;
    dataEntregaImediata: Date;
    clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto;
    listaOrcamentoCotacaoDto: OrcamentosOpcaoResponse[];
    cadastradoPor:string;
    dataCadastro:string;
}
