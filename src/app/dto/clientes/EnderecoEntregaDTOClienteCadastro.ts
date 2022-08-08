export class EnderecoEntregaDtoClienteCadastro {
    constructor() {
        this.OutroEndereco = false
    }

    EndEtg_endereco: string;
    EndEtg_endereco_numero: string;
    EndEtg_endereco_complemento: string;
    EndEtg_bairro: string;
    EndEtg_cidade: string;
    EndEtg_uf: string;
    EndEtg_cep: string;
    //codigo da justificativa, preenchdio quando está criando (do spa para a api)
    EndEtg_cod_justificativa: string;
    //descrição da justificativa, preenchdio para mostrar (da api para o spa)
    EndEtg_descricao_justificativa: string;
    //se foi selecionado um endereco diferente para a entrega (do spa para a api)
    OutroEndereco: boolean = false;

    //novos campos
    EndEtg_email: string;
    EndEtg_email_xml: string;
    EndEtg_nome: string;
    EndEtg_ddd_res: string;
    EndEtg_tel_res: string;
    EndEtg_ddd_com: string;
    EndEtg_tel_com: string;
    EndEtg_ramal_com: string;
    EndEtg_ddd_cel: string;
    EndEtg_tel_cel: string;
    EndEtg_ddd_com_2: string;
    EndEtg_tel_com_2: string;
    EndEtg_ramal_com_2: string;
    EndEtg_tipo_pessoa: string;
    EndEtg_cnpj_cpf: string;
    EndEtg_contribuinte_icms_status: number;
    EndEtg_produtor_rural_status: number;
    EndEtg_ie: string;
    EndEtg_rg: string;
    St_memorizacao_completa_enderecos: number;

}
