import { OrcamentoCotacaoDto } from './orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from '../clientes/cliente-orcamento-cotacao-dto';

export class OpcoesOrcamentoCotacaoDto {
    ClienteOrcamentoCotacaoDto:ClienteOrcamentoCotacaoDto;
    ListaOrcamentoCotacaoDto: OrcamentoCotacaoDto[];
    Validade:Date;
    ObservacoesGerais:string;
}
