import { OrcamentoOpcaoDto } from './orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';

export class OrcamentoCotacaoDto {
    ClienteOrcamentoCotacaoDto:ClienteOrcamentoCotacaoDto;
    ListaOrcamentoCotacaoDto: OrcamentoOpcaoDto[];
    Validade:Date;
    ObservacoesGerais:string;
}
