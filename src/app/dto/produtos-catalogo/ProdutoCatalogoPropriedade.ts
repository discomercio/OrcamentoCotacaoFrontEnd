import { ProdutoCatalogoPropriedadeOpcao } from "./ProdutoCatalogoPropriedadeOpcao";

export class ProdutoCatalogoPropriedade{
    id:number;
    IdCfgTipoPropriedade:number; //t_CFG_TIPO_PROPRIEDADE_PRODUTO_CATALOGO.id
    IdCfgTipoPermissaoEdicaoCadastro:number;//t_CFG_TIPO_PERMISSAO_EDICAO_CADASTRO.id
    IdCfgDataType:number; //t_CFG_DATA_TYPE.id
    descricao: string;
    oculto: boolean;
    ordem: string;
    dt_cadastro: string;
    usuario_cadastro: string;
    produtoCatalogoPropriedadeOpcao:ProdutoCatalogoPropriedadeOpcao[]
}
