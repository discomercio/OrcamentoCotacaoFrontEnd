import { ClienteOrcamentoCotacaoDto } from "../clientes/cliente-orcamento-cotacao-dto";
import { OrcamentosOpcaoResponse } from "./OrcamentosOpcaoResponse";

export class OrcamentoCotacaoResponse {
    id: number;
    vendedor: string;
    nomeIniciaisEmMaiusculasVendedor: string;
    parceiro: string;
    razaoSocialNomeIniciaisEmMaiusculasParceiro:string;
    vendedorParceiro: string;
    loja: string;
    validade: string|Date;
    status:number;
    qtdeRenovacao: number;
    concordaWhatsapp: boolean;
    observacoesGerais: string;
    entregaImediata: boolean;
    dataEntregaImediata: Date;
    clienteOrcamentoCotacaoDto: ClienteOrcamentoCotacaoDto;
    listaOrcamentoCotacaoDto: OrcamentosOpcaoResponse[];
    cadastradoPor:string;
    amigavelCadastradoPor:string;
    dataCadastro:string;
    idIndicador:number;
    idIndicadorVendedor:number;
    idVendedor:number;
    statusEmail:string;
    instaladorInstala:number;
    erro:string;
    link:string;
}
