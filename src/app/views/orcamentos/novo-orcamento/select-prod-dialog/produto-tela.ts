import { ProdutoDto } from 'src/app/dto/produtos/ProdutoDto';
import { ProdutoCompostoDto } from 'src/app/dto/produtos/produtoCompostoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { ProdutoFilhoDto } from 'src/app/dto/produtos/produto-filhoDto';

export class ProdutoTela {
    /**
     * Constroi a partir de um ProdutoDto
     */
    constructor(public produtoDto: ProdutoDto, produtoCompostoDto: ProdutoCompostoDto[]) {
        // if (produtoCompostoDto != null) {
        //     this.stringBusca = ProdutoTela.StringSimples(ProdutoTela.FabrProd(produtoCompostoDto.paiFabricante, produtoCompostoDto.paiFabricanteNome, produtoCompostoDto.paiProduto) + produtoCompostoDto.paiDescricao);
        //     produtoDto.fabricante = produtoCompostoDto.paiFabricante;
        //     produtoDto.fabricante_Nome = produtoCompostoDto.paiFabricanteNome;
        //     produtoDto.produto = produtoCompostoDto.paiProduto;
        //     produtoDto.precoLista = produtoCompostoDto.paiPrecoTotal;
        //     produtoDto.descricaoHtml = produtoCompostoDto.paiDescricao;
        //     this.Filhos = produtoCompostoDto.filhos;
        // }

        // if (produtoCompostoDto == null) {
        //     this.stringBusca = ProdutoTela.StringSimples(ProdutoTela.FabrProd(produtoDto.fabricante, produtoDto.fabricante_Nome, produtoDto.produto) + produtoDto.descricaoHtml);
        //     produtoDto = produtoDto;
        //     this.Filhos = new Array();
        // }
        this.stringBusca = produtoDto !=undefined? ProdutoTela.StringSimples(ProdutoTela.FabrProd(produtoDto.fabricante, produtoDto.fabricante_Nome, produtoDto.produto) + StringUtils.TextoDeHtml(produtoDto.descricaoHtml)): "";
        const filhosDiretos = produtoDto !=undefined? produtoCompostoDto.filter(el => el.paiFabricante === produtoDto.fabricante && el.paiProduto === produtoDto.produto):  new Array();
        if (filhosDiretos.length == 0) {
            this.Filhos = new Array();
        }
        else {
            //somente pode ter uma entrada do pai no array
            this.Filhos = filhosDiretos[0].filhos;
            this.Filhos.forEach(p => {
                this.stringBusca += "/" + p.produto;
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
                if (digitado.length >= 2 && este.stringBusca.indexOf(digitado) > -1) {
                    este.visivel = true;
                }
                else {
                    este.visivel = false;
                }
            }
            if (digitado == "")
                este.visivel = true;
        }
    }

    //junta o fabricante e o produto
    //usado na tela e no checkbox
    public static FabrProd(fabricante: string, fabricante_nome: string, produto: string): string {
        if (!fabricante || !produto) {
            return "";
        }
        return fabricante + "/" + fabricante_nome + "/" + produto;
    }


}
