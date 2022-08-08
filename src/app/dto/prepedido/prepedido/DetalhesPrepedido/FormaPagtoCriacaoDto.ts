export class FormaPagtoCriacaoDto {
    Qtde_Parcelas: number;//Todos usam essa qtde
    Rb_forma_pagto: string;//Tipo da forma de pagto
    Op_av_forma_pagto: string;
    Op_pu_forma_pagto: string;
    C_pu_valor: number | null;
    C_pu_vencto_apos: number | null;
    C_pc_qtde: number | null;
    C_pc_valor: number | null;
    C_pc_maquineta_qtde: number | null;
    C_pc_maquineta_valor: number | null;
    Op_pce_entrada_forma_pagto: string | null;//Parcelado com entrada
    C_pce_entrada_valor: number | null;
    Op_pce_prestacao_forma_pagto: string;
    C_pce_prestacao_qtde: number | null;
    C_pce_prestacao_valor: number | null;
    C_pce_prestacao_periodo: number | null;
    Op_pse_prim_prest_forma_pagto: string;//Parcelado sem entrada
    C_pse_prim_prest_valor: number | null;
    C_pse_prim_prest_apos: number | null;
    Op_pse_demais_prest_forma_pagto: string;
    C_pse_demais_prest_qtde: number | null;
    C_pse_demais_prest_valor: number | null;
    C_pse_demais_prest_periodo: number | null;
    C_forma_pagto: string;//Descrição da forma de pagto
    Descricao_meio_pagto: string;
    Tipo_parcelamento: number;
}
