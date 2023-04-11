export class OrcamentoCotacaoListaResponse{
    orcamentoCotacaoListaDto: Array<ListaDto>;
    qtdeRegistros:number;
    Sucesso:boolean;
    Mensagem:string;
}

export class ListaDto {
    linhaBusca: string;
    NumeroOrcamento: string;
    NumPedido: string;
    Cliente_Obra: string;
    Vendedor: string;
    Parceiro: string;
    VendedorParceiro: string;
    Valor: string;
    Status: string;
    IdStatus:number;
    VistoEm: string;
    Mensagem: string;
    DtCadastro: Date;
    DtExpiracao: Date; 
    Loja : string;
    IdOrcamentoCotacao :number;
    IdIndicadorVendedor :number;
}

export class ListaDtoExport {
    NumeroOrcamento: string;
    NumPedido: string;
    Cliente: string;
    Vendedor: string;
    Parceiro: string;
    VendedorParceiro: string;
    Valor: string;
    Status: string;
    VistoEm: string;
    Mensagem: string;
    DtExpiracao: Date;
    DtCadastro: Date;
}
