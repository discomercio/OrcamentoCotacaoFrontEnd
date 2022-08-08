import { DadosClienteCadastroDto } from './DadosClienteCadastroDto';

import { RefBancariaDtoCliente } from './Referencias/RefBancariaDtoCliente';

import { RefComercialDtoCliente } from './Referencias/RefComercialDtoCliente';

export class ClienteCadastroDto {
    constructor()
    {
        this.DadosCliente = new DadosClienteCadastroDto()
    }
    DadosCliente: DadosClienteCadastroDto;
    RefBancaria: RefBancariaDtoCliente[];
    RefComercial: RefComercialDtoCliente[];
}
