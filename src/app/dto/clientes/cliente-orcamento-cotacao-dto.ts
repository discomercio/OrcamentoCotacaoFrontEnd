export class ClienteOrcamentoCotacaoDto {
    Nome: string;
    NomeObra: string;
    Vendedor: string;
    Email: string;
    Parceiro: string;
    Telefone: string;
    Concorda: boolean;
    Validade: Date | string;
    VendedorParceiro: string;
    Uf: string;
    Tipo: string;

    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
