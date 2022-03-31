import { FormaPagtoCriacao } from '../forma-pagto/forma-pagto-criacao';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';

export class OrcamentoOpcaoDto {
    idOrcamento:number;
    listaProdutos: ProdutoOrcamentoDto[];
    ValorTotalComRA: number | null;
    VlTotal: number | null;    
    formaPagto:FormaPagtoCriacao[];
    observacoes:string;
    percRT:number;
}
