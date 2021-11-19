export class ClienteOrcamentoCotacaoDto {
    Validade: Date | string;
    ObservacoesGerais:  string;
    Nome: string;
    NomeObra: string;
    Vendedor: string;
    Email: string;
    Parceiro: string;
    Telefone: string;
    Concorda: boolean;
    VendedorParceiro: string;
    Uf: string;
    Tipo: string;
    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
