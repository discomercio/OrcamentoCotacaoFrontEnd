import { DadosClienteCadastroDto } from './DadosClienteCadastroDto';

import { RefBancariaDtoCliente } from './Referencias/RefBancariaDtoCliente';

import { RefComercialDtoCliente } from './Referencias/RefComercialDtoCliente';

export class ClienteCadastroDto {
    DadosCliente: DadosClienteCadastroDto;
    RefBancaria: RefBancariaDtoCliente[];
    RefComercial: RefComercialDtoCliente[];
}
