import { ItensOrcamento } from "src/app/dto/orcamentos/itens-orcamento";

export class RelatorioItensOrcamento{
    Mensagem:string;
    Sucesso:string;
    listaItensOrcamento:Array<ItensOrcamento>;
}