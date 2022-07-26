import { StringUtils } from './string-utils';
import { FormataCpfCnpj } from './formata-cpf-cnpj';
import { Constantes } from '../constantes';
import { FormataTelefone } from './formata-telefone';

export class FormatarEndereco {
    formata_endereco(endereco: string, endereco_numero: string, endereco_complemento: string, bairro: string, cidade: string,
        uf: string, cep: string): string {

        //copiado do sistema em ASP
        let s_aux = "", strResposta = "";
        if (endereco && endereco.trim() != "")
            strResposta = endereco.trim();

        s_aux = endereco_numero ? endereco_numero.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + ", " + s_aux;

        s_aux = endereco_complemento ? endereco_complemento.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + " - " + s_aux;

        s_aux = bairro ? bairro.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + " - " + s_aux;

        s_aux = cidade ? cidade.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + " - " + s_aux;

        s_aux = uf ? uf.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + " - " + s_aux;

        s_aux = cep ? cep.trim() : "";
        if (s_aux != "")
            strResposta = strResposta + " - " + this.cep_formata(s_aux);

        return strResposta;
    }

    //     ' ------------------------------------------------------------------------
    // '   CEP_FORMATA
    // ' 
    cep_formata(cep: string): string {
        let s_cep = StringUtils.retorna_so_digitos(cep);

        if (!this.cep_ok(s_cep))
            return "";
        s_cep = s_cep.substr(0, 5) + "-" + s_cep.substr(5, 3);
        return s_cep;
    }

    // ' ------------------------------------------------------------------------
    // '   CEP OK?
    // ' 
    cep_ok(cep: string): boolean {
        let s_cep = StringUtils.retorna_so_digitos(cep);
        if (s_cep.length == 0 || s_cep.length == 5 || s_cep.length == 8)
            return true;
        return false;
    }

    constante: Constantes = new Constantes();
    montarEnderecoEntregaPF(enderecoEntrega: any, sEndereco: string): string {
        let sCabecalho: string = "";
        let aux: string = "";
        let sTelefones: string = "";
        let retorno: string = "";
        let emails: string = "";

        if (!!enderecoEntrega.EndEtg_nome)
            sCabecalho = enderecoEntrega.EndEtg_nome;

        sCabecalho += " \nCPF: " + FormataCpfCnpj.cnpj_cpf_formata(enderecoEntrega.EndEtg_cnpj_cpf);

        aux = "";
        if (enderecoEntrega.EndEtg_produtor_rural_status == this.constante.COD_ST_CLIENTE_PRODUTOR_RURAL_SIM) {
            if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO)
                aux = "Sim (Não contribuinte)";
            if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM)
                aux = "Sim (IE: " + enderecoEntrega.EndEtg_ie + ")";
            if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO)
                aux = "Sim (Isento)";
        }

        if (enderecoEntrega.EndEtg_produtor_rural_status == this.constante.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO)
            aux = "Não";

        if (aux != "") {
            sCabecalho += " - Produtor rural: " + aux;
        }

        sCabecalho += "\n";

        //fomatar telefones
        //tel residencial e celular
        let telRes: string = "";
        let telCel: string = "";
        if (!!enderecoEntrega.EndEtg_tel_res && enderecoEntrega.EndEtg_tel_res != "")
            telRes = FormataTelefone.formatarDDDTelRamal(enderecoEntrega.EndEtg_ddd_res, enderecoEntrega.EndEtg_tel_res, "");
        if (!!enderecoEntrega.EndEtg_tel_cel && enderecoEntrega.EndEtg_tel_cel != "")
            telCel = FormataTelefone.formatarDDDTelRamal(enderecoEntrega.EndEtg_ddd_cel, enderecoEntrega.EndEtg_tel_cel, "");

        sTelefones = "";
        if ((!!telRes && telRes != "") || (!!telCel && telCel != ""))
            sTelefones = "\n";

        if (!!telRes && telRes != "") {
            sTelefones += "Telefone " + telRes;
            if (!!telCel && telCel != "")
                sTelefones += " - ";
        }

        if (!!telCel && telCel != "")
            sTelefones += "Celular " + telCel;

        if ((!!enderecoEntrega.EndEtg_email && enderecoEntrega.EndEtg_email != "") ||
            (!!enderecoEntrega.EndEtg_email_xml && enderecoEntrega.EndEtg_email_xml != ""))
            emails = "\n";

        if (!!enderecoEntrega.EndEtg_email && enderecoEntrega.EndEtg_email != "")
            emails += "E-mail: " + enderecoEntrega.EndEtg_email + " ";

        if (!!enderecoEntrega.EndEtg_email_xml && enderecoEntrega.EndEtg_email_xml != "")
            emails += "E-mail (XML): " + enderecoEntrega.EndEtg_email_xml;

        retorno = sCabecalho + sEndereco + sTelefones + emails + "\n" + enderecoEntrega.EndEtg_descricao_justificativa;

        return retorno;
    }

    montarEnderecoEntregaPJ(enderecoEntrega: any, sEndereco: string): string {
        let sCabecalho: string = "";
        let aux: string = "";
        let sTelefones: string = "";
        let retorno: string = "";
        let emails: string = "";

        if (!!enderecoEntrega.EndEtg_nome)
            sCabecalho = enderecoEntrega.EndEtg_nome;

        sCabecalho += " \nCNPJ: " + FormataCpfCnpj.cnpj_cpf_formata(enderecoEntrega.EndEtg_cnpj_cpf);

        if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO)
            aux = "Não";
        if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM)
            aux = "Sim (IE: " + enderecoEntrega.EndEtg_ie + ")";
        if (enderecoEntrega.EndEtg_contribuinte_icms_status == this.constante.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO)
            aux = "Isento";

        if (!!aux)
            sCabecalho += " - Contribuinte ICMS: " + aux;

        sCabecalho += "\n";

        let telCom: string = "";
        let telCom2: string = "";
        if (!!enderecoEntrega.EndEtg_tel_com && enderecoEntrega.EndEtg_tel_com != "")
            telCom = FormataTelefone.formatarDDDTelRamal(enderecoEntrega.EndEtg_ddd_com, enderecoEntrega.EndEtg_tel_com,
                enderecoEntrega.EndEtg_ramal_com);
        if (!!enderecoEntrega.EndEtg_tel_com_2 && enderecoEntrega.EndEtg_tel_com_2 != "")
            telCom2 = FormataTelefone.formatarDDDTelRamal(enderecoEntrega.EndEtg_ddd_com_2, enderecoEntrega.EndEtg_tel_com_2,
                enderecoEntrega.EndEtg_ramal_com_2);

        sTelefones = "";
        if ((!!telCom && telCom != "") || (!!telCom2 && telCom2 != ""))
            sTelefones = "\nTelefone ";

        if (!!telCom && telCom != "") {
            sTelefones += telCom;
            if (!!telCom2 && telCom2 != "")
                sTelefones += " - ";
        }

        if (!!telCom2 && telCom2 != "")
            sTelefones += telCom2;

        if ((!!enderecoEntrega.EndEtg_email && enderecoEntrega.EndEtg_email != "") ||
            (!!enderecoEntrega.EndEtg_email_xml && enderecoEntrega.EndEtg_email_xml != ""))
            emails = "\n";

        if (!!enderecoEntrega.EndEtg_email && enderecoEntrega.EndEtg_email != "")
            emails += "E-mail: " + enderecoEntrega.EndEtg_email + " ";

        if (!!enderecoEntrega.EndEtg_email_xml && enderecoEntrega.EndEtg_email_xml != "")
            emails += "E-mail (XML): " + enderecoEntrega.EndEtg_email_xml;

        retorno = sCabecalho + sEndereco + sTelefones + emails + "\n" + enderecoEntrega.EndEtg_descricao_justificativa;

        return retorno;
    }
}

