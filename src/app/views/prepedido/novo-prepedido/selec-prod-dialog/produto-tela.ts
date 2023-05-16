import { ProdutoFilhoDto } from "src/app/dto/prepedido/Prepedido/ProdutoFilhoDto";
import { ProdutoCompostoDto } from "src/app/dto/prepedido/Produto/ProdutoCompostoDto";
import { ProdutoDto } from "src/app/dto/prepedido/Produto/ProdutoDto";
import { StringUtils } from "src/app/utilities/formatarString/string-utils";

//para mostrar um produto na tela
export class ProdutoTela {
    /**
     * Constroi a partir de um ProdutoDto
     */
    constructor(public produtoDto: ProdutoDto, produtoCompostoDto: ProdutoCompostoDto[]) {
        this.stringBusca = ProdutoTela.StringSimples(ProdutoTela.FabrProd(produtoDto.Fabricante, produtoDto.Fabricante_Nome, produtoDto.Produto) + "/" + StringUtils.TextoDeHtml(produtoDto.Descricao_html));
        const filhosDiretos = produtoCompostoDto.filter(el => el.PaiFabricante === produtoDto.Fabricante && el.PaiProduto === produtoDto.Produto);
        if (filhosDiretos.length == 0) {
            this.Filhos = new Array();
        }
        else {
            //somente pode ter uma entrada do pai no array
            this.Filhos = filhosDiretos[0].Filhos;
            this.Filhos.forEach(p => {
                this.stringBusca += "/" + p.Produto + "/";
            });
        }
    }

    //a busca é feita contra esta string
    public stringBusca: string;

    //se esta está visível
    public visivel = true;

    //os filhos que esse cara tem
    public Filhos: ProdutoFilhoDto[];

    //rotina para converter para o formato da busca: sem espaços em e minúsculas
    public static StringSimples(msg: string) {
        if (!msg)
            return "";
        msg = msg.toLowerCase().replace(/ /g, '');
        return msg;
    }

    //atualiza todoa visibilidade de todo mundo em um array
    public static AtualizarVisiveis(arr: ProdutoTela[], digitado: string) {
        digitado = ProdutoTela.StringSimples(digitado);
        for (let i = 0; i < arr.length; i++) {
            let este = arr[i];
            if (digitado != "") {
                
                if (digitado.length >= 2 && parseInt(este.produtoDto.Produto) == parseInt(digitado) && este.produtoDto.UnitarioVendavel) {
                    este.visivel = true;
                }
                //***Se pedirem para poder filtrar por filhotes, descomentar esse código
                //Se descomentar esse código, poderá aparecer mais de 1 produto na lista, sendo assim, 
                //precisa remover a seleção automática do checkbox
                // else if(arr[i].Filhos.length > 0 && este.produtoDto.UnitarioVendavel){
                //     let existeFilhos = este.Filhos.filter(x => parseInt(x.Produto) == parseInt(digitado));
                //     if(existeFilhos.length > 0){
                //         este.visivel = true;
                //     }
                // }
                else {
                    este.visivel = false;
                }
            }
            if (digitado == "")
                este.visivel = false;
            // if (digitado != "" && parseInt(este.produtoDto.Produto) == parseInt(digitado)) {
            //     este.visivel = true;
            // }           
            // else {
            //     este.visivel = false;
            // }

        }
    }

    //junta o fabricante e o produto
    //usado na tela e no checkbox
    public static FabrProd(fabricante: string, fabricante_nome:string, produto: string): string {
        if (!fabricante || !produto) {
            return "";
        }
        return fabricante + "/" + fabricante_nome + "/" + produto;
    }

    
}