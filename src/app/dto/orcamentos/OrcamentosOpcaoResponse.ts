
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';




export class OrcamentosOpcaoResponse {
    listaProdutos: ProdutoOrcamentoDto[];
    VlTotal: number | null;    
    formaPagto:FormaPagtoCriacao[];
    percRT:number;
}
