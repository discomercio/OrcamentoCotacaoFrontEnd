import { MensageriaDadosDto } from './MensageriaDadosDto';
import { OrcamentoOpcaoDto } from './orcamento-opcao-dto';
import { FormaPagto } from '../forma-pagto/forma-pagto';
import { lojaEstilo } from '../lojas/lojaEstilo';

export class OrcamentoCotacaoDto {
    id: number;
    loja: string;
    nomeCliente: string;
    tipoCliente: string;
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
    status: number;
    token: string;
    condiCoesGerais: string;
    contribuinteIcms:number;
    listaFormasPagto: FormaPagto[];
    listaOpcoes: OrcamentoOpcaoDto[];
    mensageria: MensageriaDadosDto;

    lojaViewModel:lojaEstilo;
}

