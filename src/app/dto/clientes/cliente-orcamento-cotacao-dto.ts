export class ClienteOrcamentoCotacaoDto {
    id: number;
    nomeCliente: string;
    nomeObra: string;
    email: string;
    telefone: string;
    uf: string;
    tipo: string;
    contribuinteICMS: number;
    public constructor(init?: Partial<ClienteOrcamentoCotacaoDto>) {
        Object.assign(this, init);
    }
}
