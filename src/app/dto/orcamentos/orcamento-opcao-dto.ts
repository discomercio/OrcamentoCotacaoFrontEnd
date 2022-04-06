import { FormaPagtoCriacao } from '../forma-pagto/forma-pagto-criacao';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';

export class OrcamentoOpcaoDto {
    idOrcamento:number;
    listaProdutos: ProdutoOrcamentoDto[];
    VlTotal: number | null;    
    formaPagto:FormaPagtoCriacao[];
    percRT:number;
}
