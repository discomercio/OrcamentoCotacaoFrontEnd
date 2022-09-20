import { DadosClienteCadastroDto } from "../clientes/DadosClienteCadastroDto";
import { EnderecoEntregaDtoClienteCadastro } from "../clientes/EnderecoEntregaDTOClienteCadastro";

export class AprovacaoOrcamentoDto{
    idOrcamento:number;
    idOpcao:number;
    idFormaPagto:number;
    dadosClienteDto:DadosClienteCadastroDto;
    enderecoEntregaDto:EnderecoEntregaDtoClienteCadastro;
}