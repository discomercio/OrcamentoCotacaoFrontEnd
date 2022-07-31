import { ProdutoComboDto } from "src/app/dto/prepedido/Produto/ProdutoComboDto";

//controle para a seleção do produto
export class SelecProdInfo {

    //entrada
    public produtoComboDto: ProdutoComboDto;

    //entrada e saída
    public Fabricante: string;
    public Fabricante_Nome: string;
    public Produto: string;
    public Qte: number;

    //saída
    public ClicouOk: boolean;

}

