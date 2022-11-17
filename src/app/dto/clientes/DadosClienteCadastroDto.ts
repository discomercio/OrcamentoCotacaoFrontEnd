
import { EnderecoCadastralClientePrepedidoDto } from '../prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { EnderecoEntregaDtoClienteCadastro } from './EnderecoEntregaDTOClienteCadastro';


export class DadosClienteCadastroDto {
    constructor(){
        this.ProdutorRural = -1
    }
    Loja: string;
    Indicador_Orcamentista: string;
    Vendedor: string;
    Id: string;
    Cnpj_Cpf: string;
    Rg: string;
    Ie: string;
    Contribuinte_Icms_Status: number;
    Tipo: string;
    Observacao_Filiacao: string;
    Sexo: string;
    Nome: string;
    ProdutorRural: number;
    Endereco: string;
    Numero: string;
    Complemento: string;
    Bairro: string;
    Cidade: string;
    Uf: string;
    Cep: string;
    DddResidencial: string;
    TelefoneResidencial: string;
    DddComercial: string;
    TelComercial: string;
    Ramal: string;
    DddCelular: string;
    Celular: string;
    TelComercial2: string;
    DddComercial2: string;
    Ramal2: string;
    Email: string;
    EmailXml: string;
    Contato: string;
    UsuarioCadastro:string;

    public static DadosClienteCadastroDtoDeEnderecoEntregaDtoClienteCadastro(end: EnderecoEntregaDtoClienteCadastro): DadosClienteCadastroDto {
        let dados: DadosClienteCadastroDto = new DadosClienteCadastroDto();
        dados.Cnpj_Cpf = end.EndEtg_cnpj_cpf;
        dados.Rg = end.EndEtg_rg;
        dados.Ie = end.EndEtg_ie;
        dados.Contribuinte_Icms_Status = end.EndEtg_contribuinte_icms_status;
        dados.Tipo = end.EndEtg_tipo_pessoa;
        dados.Nome = end.EndEtg_nome;
        dados.ProdutorRural = end.EndEtg_produtor_rural_status;
        dados.DddResidencial = end.EndEtg_ddd_res;
        dados.TelefoneResidencial = end.EndEtg_tel_res;
        dados.DddComercial = end.EndEtg_ddd_com;
        dados.TelComercial = end.EndEtg_tel_com;
        dados.Ramal = end.EndEtg_ramal_com != null ? end.EndEtg_ramal_com : "";
        dados.DddCelular = end.EndEtg_ddd_cel;
        dados.Celular = end.EndEtg_tel_cel;
        dados.DddComercial2 = end.EndEtg_ddd_com_2;
        dados.TelComercial2 = end.EndEtg_tel_com_2;
        dados.Ramal2 = end.EndEtg_ramal_com_2 != null ? end.EndEtg_ramal_com_2 : "";
        dados.Email = end.EndEtg_email;
        dados.EmailXml = end.EndEtg_email_xml;

        return dados;
    }

    public static DadosClienteCadastroDtoDeEnderecoCadastralClientePrepedidoDto(end: EnderecoCadastralClientePrepedidoDto): DadosClienteCadastroDto {

        let dados: DadosClienteCadastroDto = new DadosClienteCadastroDto();
        dados.Cnpj_Cpf = end.Endereco_cnpj_cpf != null ? end.Endereco_cnpj_cpf : "";
        dados.Rg = end.Endereco_rg != null ? end.Endereco_rg : "";
        dados.Ie = end.Endereco_ie != null ? end.Endereco_ie : "";
        dados.Contribuinte_Icms_Status = end.Endereco_contribuinte_icms_status;
        dados.Tipo = end.Endereco_tipo_pessoa != null ? end.Endereco_tipo_pessoa : "";
        dados.Nome = end.Endereco_nome != null ? end.Endereco_nome : "";
        dados.ProdutorRural = end.Endereco_produtor_rural_status;
        dados.DddResidencial = end.Endereco_ddd_res != null ? end.Endereco_ddd_res : "";
        dados.TelefoneResidencial = end.Endereco_tel_res != null ? end.Endereco_tel_res : "";
        dados.DddComercial = end.Endereco_ddd_com != null ? end.Endereco_ddd_com : "";
        dados.TelComercial = end.Endereco_tel_com != null ? end.Endereco_tel_com : "";
        dados.Ramal = end.Endereco_ramal_com != null ? end.Endereco_ramal_com : "";
        dados.DddCelular = end.Endereco_ddd_cel != null ? end.Endereco_ddd_cel : "";
        dados.Celular = end.Endereco_tel_cel != null ? end.Endereco_tel_cel : "";
        dados.DddComercial2 = end.Endereco_ddd_com_2 != null ? end.Endereco_ddd_com_2 : "";
        dados.TelComercial2 = end.Endereco_tel_com_2 != null ? end.Endereco_tel_com_2 : "";
        dados.Ramal2 = end.Endereco_ramal_com_2 != null ? end.Endereco_ramal_com_2 : "";
        dados.Email = end.Endereco_email != null ? end.Endereco_email : "";
        dados.EmailXml = end.Endereco_email_xml != null ? end.Endereco_email_xml : "";
        dados.Contato = end.Endereco_contato != null ? end.Endereco_contato : "";
        dados.Endereco = end.Endereco_logradouro != null ? end.Endereco_logradouro : "";
        dados.Numero = end.Endereco_numero != null ? end.Endereco_numero : "";
        dados.Complemento = end.Endereco_complemento != null ? end.Endereco_complemento : "";
        dados.Bairro = end.Endereco_bairro != null ? end.Endereco_bairro : "";
        dados.Cidade = end.Endereco_cidade != null ? end.Endereco_cidade : "";
        dados.Uf = end.Endereco_uf != null ? end.Endereco_uf : "";
        dados.Cep = end.Endereco_cep != null ? end.Endereco_cep : "";

        return dados;
    }
}
