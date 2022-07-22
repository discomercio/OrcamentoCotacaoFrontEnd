export class ClienteOrcamentoCotacaoDto {
    id:number;
    nomeCliente: string;
    nomeObra: string;
    email: string;
    telefone: string;
    uf: string;
    tipo: string;
    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
