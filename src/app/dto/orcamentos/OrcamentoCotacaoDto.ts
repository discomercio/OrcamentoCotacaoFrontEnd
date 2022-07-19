import { MensageriaDadosDto } from './MensageriaDadosDto';
import { OrcamentoOpcaoDto } from './orcamento-opcao-dto';
import { FormaPagto } from '../forma-pagto/forma-pagto';

export class OrcamentoCotacaoDto {
    id: number;
    loja: string;
    nomeCliente: string;
    nomeObra: string;
    vendedor: string;
    parceiro: string;
    vendedorParceiro: string;
    validade: Date;
    qtdeRenovacao: number;
    concordaWhatsapp: boolean;
    observacoesGerais: string;
    entregaImediata: boolean;
    stEntregaImediata: number;
    dataEntregaImediata: Date;
    usuarioCadastro: string;
    uf: string;
    telefone: string;
    email: string;
    token: string;

    listaFormasPagto: FormaPagto[];
    listaOpcoes: OrcamentoOpcaoDto[];
    mensageria: MensageriaDadosDto;
}

