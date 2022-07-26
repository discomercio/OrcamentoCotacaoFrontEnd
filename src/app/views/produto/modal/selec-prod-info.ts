import { ProdutoComboDto } from 'src/app/dto/produtos/ProdutoComboDto';

export class SelecProdInfo {

    constructor() {
        this.produtoComboDto = new ProdutoComboDto
    }

    //entrada
    public produtoComboDto: ProdutoComboDto

    //entrada e saída
    public Fabricante: string;
    public Fabricante_Nome: string;
    public Produto: string;
    public Qte: number;

    //saída
    public ClicouOk: boolean;

}