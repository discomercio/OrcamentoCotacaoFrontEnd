export class FormaPagtoCriacao {
    id: number;
    idOpcao: number;
    qtde_Parcelas: number;//Todos usam essa qtde
    op_av_forma_pagto: number; //meio pagto
    op_pu_forma_pagto: string;
    c_pu_valor: number | null;
    c_pu_vencto_apos: number | null;
    c_pc_qtde: number | null;
    c_pc_valor: number | null;
    c_pc_maquineta_qtde: number | null;
    c_pc_maquineta_valor: number | null;
    op_pce_entrada_forma_pagto: string | null;//Parcelado com entrada
    o_pce_entrada_valor: number | null;
    op_pce_prestacao_forma_pagto: string;
    c_pce_prestacao_qtde: number | null;
    c_pce_prestacao_valor: number | null;
    c_pce_prestacao_periodo: number | null;
    op_pse_prim_prest_forma_pagto: string;//Parcelado sem entrada
    c_pse_prim_prest_valor: number | null;
    c_pse_prim_prest_apos: number | null;
    op_pse_demais_prest_forma_pagto: string;
    c_pse_demais_prest_qtde: number | null;
    c_pse_demais_prest_valor: number | null;
    c_pse_demais_prest_periodo: number | null;
    c_forma_pagto: string;//Descrição da forma de pagto
    descricao_meio_pagto: string;
    tipo_parcelamento: number;
    observacoesGerais: string;
    aprovado: boolean;
    habilitado: boolean = false;
}