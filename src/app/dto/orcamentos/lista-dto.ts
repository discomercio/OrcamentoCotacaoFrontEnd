export class ListaDto {
    NumOrcamento: string;
    NumPedido: string;
    Cliente_Obra: string;
    Vendedor: string;
    Parceiro: string;
    VendedorParceiro: string;
    Valor: string;
    Status: string;
    VistoEm: string;
    Mensagem: string;
    DtCadastro: Date;
}

export class ListaDtoExport {
    Data: Date|string;
    Numero: string;
    Nome: string;
    Status: string;
    Valor: string;
}