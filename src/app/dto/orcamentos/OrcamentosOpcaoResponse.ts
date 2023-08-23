
import { FormaPagtoCriacao } from 'src/app/dto/forma-pagto/forma-pagto-criacao';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';




export class OrcamentosOpcaoResponse {
    id:number;
    listaProdutos: ProdutoOrcamentoDto[];
    vlTotal: number | null;    
    formaPagto:FormaPagtoCriacao[];
    percRT:number;
    loja:string;
    aprovado: boolean;
    pagtoSelecionado:FormaPagtoCriacao;
}
