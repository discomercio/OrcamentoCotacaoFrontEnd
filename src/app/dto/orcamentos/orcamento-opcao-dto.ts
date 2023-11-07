import { FormaPagtoCriacao } from '../forma-pagto/forma-pagto-criacao';
import { ProdutoOrcamentoDto } from '../produtos/ProdutoOrcamentoDto';

export class OrcamentoOpcaoDto {
    listaProdutos: ProdutoOrcamentoDto[];
    VlTotal: number | null;
    formaPagto: FormaPagtoCriacao[];
    percRT: number;
    id: number;
    idOrcamentoCotacao: number;
    aprovado:boolean;
    existeImagemProduto:boolean;
    pagtoSelecionado:FormaPagtoCriacao;
    sequencia:number;
}
