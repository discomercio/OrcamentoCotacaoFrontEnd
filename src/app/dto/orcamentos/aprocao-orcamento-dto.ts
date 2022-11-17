import { ClienteCadastroDto } from "../clientes/ClienteCadastroDto";
import { DadosClienteCadastroDto } from "../clientes/DadosClienteCadastroDto";
import { EnderecoEntregaDtoClienteCadastro } from "../clientes/EnderecoEntregaDTOClienteCadastro";

export class AprovacaoOrcamentoDto{
    idOrcamento:number;
    idOpcao:number;
    idFormaPagto:number;
    clienteCadastroDto:ClienteCadastroDto;
    enderecoEntregaDto:EnderecoEntregaDtoClienteCadastro;
    guid: string;
}