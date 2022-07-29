import { ProdutoComboDto } from "../produtos/ProdutoComboDto";


//controle para a seleção do produto
export class SelecProdInfo {

    //entrada
    public produtoComboDto: ProdutoComboDto;

    //entrada e saída
    public Fabricante: string;
    public Fabricante_Nome: string;
    public Produto: string;
    public Qte: number;

    public Uf: string;
    public tipoCliente: string;
    public siglaPagto: string;
    public qtdeMaxParcelas: number;
    //saída
    public ClicouOk: boolean;
  retornaIndividual: boolean;

}

