export class ClienteOrcamentoCotacaoDto {
    validade: Date | string;
    observacoesGerais:  string;
    nome: string;
    nomeObra: string;
    vendedor: string;
    email: string;
    parceiro: string;
    telefone: string;
    concordaWhatsapp: boolean;
    vendedorParceiro: string;
    uf: string;
    tipo: string;
    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
