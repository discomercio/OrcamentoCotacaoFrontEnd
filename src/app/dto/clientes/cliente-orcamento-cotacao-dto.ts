export class ClienteOrcamentoCotacaoDto {
    id:number;
    validade: Date | string;
    observacoes:  string;
    nomeCliente: string;
    nomeObra: string;
    vendedor: string;
    email: string;
    parceiro: string;
    telefone: string;
    concordaWhatsapp: boolean;
    vendedorParceiro: string;
    uf: string;
    tipo: string;
    loja:string;
    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
