import { MensagemDtoOcorrenciaPedido } from './MensagemDtoOcorrenciaPedido';

export class OcorrenciasDtoPedido {
    Usuario: string;
    Dt_Hr_Cadastro: Date | string;
    Situacao: string;//se qtde _msg_central > 0 = Em Andamento senão = Aberta
    Contato: string;
    Texto_Ocorrencia: string;
    mensagemDtoOcorrenciaPedidos: MensagemDtoOcorrenciaPedido[];
    Finalizado_Usuario: string;
    Finalizado_Data_Hora: Date | string | null;
    Tipo_Ocorrencia: string;//obtem_descricao_tabela_t_codigo_descricao(GRUPO_T_CODIGO_DESCRICAO__OCORRENCIAS_EM_PEDIDOS__TIPO_OCORRENCIA, Trim("" & rs("tipo_ocorrencia")))
    Texto_Finalizacao: string;
}
