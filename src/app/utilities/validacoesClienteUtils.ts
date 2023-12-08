import { CpfCnpjUtils } from './cpfCnpjUtils';
import { isDate } from 'util';
import { getLocaleDateFormat } from '@angular/common';
import { Constantes } from '../dto/prepedido/Constantes';
import { DadosClienteCadastroDto } from '../dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ClienteCadastroDto } from '../dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { ClienteCadastroUtils } from '../dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { EnderecoCadastralClientePrepedidoDto } from '../dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { EnderecoEntregaDtoClienteCadastro } from '../dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { StringUtils } from './formatarString/string-utils';
import { ValidacoesUtils } from './validacao-formulario/validacoesUtils';
import { DataUtils } from './formatarString/data-utils';
import { RefBancariaDtoCliente } from '../dto/prepedido/ClienteCadastro/Referencias/RefBancariaDtoCliente';
import { RefComercialDtoCliente } from '../dto/prepedido/ClienteCadastro/Referencias/RefComercialDtoCliente';
import { FormatarTelefone } from './formatarTelefone';
import { FormatarEndereco } from './formatarEndereco';

export class ValidacoesClienteUtils {

    public static constantes = new Constantes();

    //valida somente cadastro novo de cliente
    public static ValidarDadosClienteCadastroDto(dadosClienteCadastroDto: DadosClienteCadastroDto,
        clienteCadastroDto: ClienteCadastroDto, ehPf: boolean, lstCidadesIBGE: string[]): string[] {
        //
        //validações
        let validacoes: string[] = new Array();
        /*
        campos obrigatórios para PF:
        CPF / produtor rural / ENDEREÇO / nro / BAIRRO / CIDADE / UF / CEP / algum telefone
    
        campos obrigatórios para PJ:
        CNPJ / CONTRIBUINTE ICMS / RAZÃO SOCIAL / TELEFONE / NOME DA PESSOA PARA CONTATO NA EMPRESA / ENDEREÇO /
        nro / BAIRRO / CIDADE / UF / CEP    
        */

        //um MONTE de validações....
        validacoes = validacoes.concat(this.validarGeral(dadosClienteCadastroDto, true));

        //validações específicas para PF e PJ
        if (!ehPf) {
            validacoes = validacoes.concat(this.validarGeralPj(dadosClienteCadastroDto, true));
        }

        debugger
        if (!!dadosClienteCadastroDto.EmailBoleto || dadosClienteCadastroDto.EmailBoleto !== "") {
            if (!ValidacoesUtils.email_ok(dadosClienteCadastroDto.EmailBoleto)) {
                validacoes.push('E-mail boleto inválido!');
            }
        }

        //endereço
        validacoes = validacoes.concat(this.validarEndereco(dadosClienteCadastroDto, lstCidadesIBGE));

        //inscricao estadual
        let mensagem = new ClienteCadastroUtils().validarInscricaoestadualIcms(dadosClienteCadastroDto);
        if (mensagem && mensagem.trim() !== "") {
            validacoes.push(mensagem);
        }

        //validar telefone
        validacoes = validacoes.concat(this.validarTelefones(dadosClienteCadastroDto, ehPf, true));

        //validar referências bancárias
        //não exigimos um número de referências, mas as que foram criadas devem estar preenchidas
        if (clienteCadastroDto) {
            for (let i = 0; i < clienteCadastroDto.RefBancaria.length; i++) {
                let este = clienteCadastroDto.RefBancaria[i];
                validacoes = validacoes.concat(this.validarRefBancaria(este));
            }

            //validar referências comerciais
            //não exigimos um número de referências, mas as que foram criadas devem estar preenchidas    
            for (let i = 0; i < clienteCadastroDto.RefComercial.length; i++) {
                let este = clienteCadastroDto.RefComercial[i];
                validacoes = validacoes.concat(this.validarRefComerial(este));
            }

            validacoes = validacoes.concat(this.verificarRefComercialDuplicada(clienteCadastroDto.RefComercial));
        }

        return validacoes;
    }

    //valida dados cadastrais
    public static validarEnderecoCadastralClientePrepedidoDto(endCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto,
        lstCidadesIBGE: string[]): string[] {
        let dadosClienteCadastroDto =
            DadosClienteCadastroDto.DadosClienteCadastroDtoDeEnderecoCadastralClientePrepedidoDto(endCadastralClientePrepedidoDto);
        let validacoes: string[] = new Array();

        let ehPf = dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ? true : false;

        validacoes = validacoes.concat(validacoes = validacoes.concat(this.validarGeral(dadosClienteCadastroDto, true)));

        //converter telefones para separar os dados
        //dadosClienteCadastroDto = this.converterTelefones(dadosClienteCadastroDto);

        if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ)
            validacoes = validacoes.concat(this.validarGeralPj(dadosClienteCadastroDto, true));

        validacoes = validacoes.concat(this.validarEndereco(dadosClienteCadastroDto, lstCidadesIBGE));

        let mensagem = new ClienteCadastroUtils().validarInscricaoestadualIcms(dadosClienteCadastroDto);
        if (mensagem && mensagem.trim() !== "") {
            validacoes.push(mensagem);
        }
        //validar telefone
        validacoes = validacoes.concat(this.validarTelefones(dadosClienteCadastroDto, ehPf, true));

        let msgErrosEndEtg: string[] = new Array();
        if (validacoes.length > 0) {
            validacoes.forEach(x => {
                msgErrosEndEtg.push("Dados cadastrais: " + x);
            });
        }

        return msgErrosEndEtg;
    }
    //valida dados da pessoa da entrega
    public static validarEnderecoEntregaDtoClienteCadastro(endEtg: EnderecoEntregaDtoClienteCadastro,
        endCadastral: EnderecoCadastralClientePrepedidoDto, lstCidadeIBGE: string[]): string[] {

        let validacoes: string[] = new Array();

        validacoes = validacoes.concat(this.validarEnderecoEntrega(endEtg, endCadastral.Endereco_tipo_pessoa, lstCidadeIBGE));

        if (endCadastral.Endereco_tipo_pessoa == this.constantes.ID_PF) {
            //vamos passar automático
            endEtg.EndEtg_tipo_pessoa = endCadastral.Endereco_tipo_pessoa;
            endEtg.EndEtg_nome = endCadastral.Endereco_nome;
            endEtg.EndEtg_cnpj_cpf = endCadastral.Endereco_cnpj_cpf;
            endEtg.EndEtg_rg = endCadastral.Endereco_rg;
            endEtg.EndEtg_email = endCadastral.Endereco_email;
            endEtg.EndEtg_email_xml = endCadastral.Endereco_email_xml;
            endEtg.EndEtg_produtor_rural_status = endCadastral.Endereco_produtor_rural_status;
            endEtg.EndEtg_contribuinte_icms_status = endCadastral.Endereco_contribuinte_icms_status;
            endEtg.EndEtg_ie = endCadastral.Endereco_ie;
        }
        if (endCadastral.Endereco_tipo_pessoa == this.constantes.ID_PJ) {
            endEtg.EndEtg_email = endCadastral.Endereco_email;
            endEtg.EndEtg_email_xml = endCadastral.Endereco_email_xml;
        }
        //vamos converter para
        let dadosClienteCadastroDto = DadosClienteCadastroDto.DadosClienteCadastroDtoDeEnderecoEntregaDtoClienteCadastro(endEtg);

        //converter telefones para separar os dados
        // dadosClienteCadastroDto = this.converterTelefones(dadosClienteCadastroDto);

        //valida cpf, cnpj, email e emailxml
        if (endCadastral.Endereco_tipo_pessoa == this.constantes.ID_PJ)
            validacoes = validacoes.concat(this.validarGeral(dadosClienteCadastroDto, false));

        //valida contribuinteICMS e IE
        if (endCadastral.Endereco_tipo_pessoa == this.constantes.ID_PJ) {
            let mensagem = new ClienteCadastroUtils().validarInscricaoestadualIcms(dadosClienteCadastroDto);
            if (mensagem && mensagem.trim() !== "") {
                validacoes.push(mensagem);
            }

            //se produtor rural = não altera o valor de contribuinte e Ie
            this.validarProdutorRural(dadosClienteCadastroDto);
        }

        let ehPf: boolean = dadosClienteCadastroDto.Tipo == this.constantes.ID_PF ? true : false;

        if (endCadastral.Endereco_tipo_pessoa == this.constantes.ID_PJ)
            validacoes = validacoes.concat(this.validarTelefones(dadosClienteCadastroDto, ehPf, false));

        let msgErrosEndEtg: string[] = new Array();
        if (validacoes.length > 0) {
            validacoes.forEach(x => {
                msgErrosEndEtg.push("Endereço de entrega: " + x);
            });
        }

        return msgErrosEndEtg;
    }


    //novos métodos para validar Gabriel
    private static validarGeral(dadosClienteCadastroDto: DadosClienteCadastroDto, ehObrigatorio: boolean): string[] {
        let ret: string[] = new Array();

        if (!dadosClienteCadastroDto.Nome || dadosClienteCadastroDto.Nome.trim() == "") {
            ret.push('Preencha o nome!');
        }
        if (!!dadosClienteCadastroDto.Cnpj_Cpf || (dadosClienteCadastroDto.Cnpj_Cpf.trim() !== "")) {
            if (CpfCnpjUtils.cnpj_cpf_ok(dadosClienteCadastroDto.Cnpj_Cpf)) {
                let cpf_cnpj = StringUtils.retorna_so_digitos(dadosClienteCadastroDto.Cnpj_Cpf);
                if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PF &&
                    cpf_cnpj.length > 11) {
                    ret.push('CPF inválido!');
                }
                if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ) {
                    if (cpf_cnpj.length > 14 || cpf_cnpj.length < 14) {
                        ret.push('CNPJ inválido!');
                    }
                }
            }
            else {
                ret.push('CNPJ/CPF inválido!');
            }
        } else {
            ret.push('PREENCHA CNPJ/CPF');
        }

        if (ehObrigatorio) {
            //se for PJ é obrigatório
            if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ) {
                //se estiver vazio
                if (!ValidacoesUtils.email_ok(dadosClienteCadastroDto.Email)) {
                    ret.push('E-mail inválido!');
                }
            }
            if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
                if (!!dadosClienteCadastroDto.Email || dadosClienteCadastroDto.Email !== "") {
                    if (!ValidacoesUtils.email_ok(dadosClienteCadastroDto.Email)) {
                        ret.push('E-mail inválido!');
                    }
                }
            }

            if (!!dadosClienteCadastroDto.EmailXml || dadosClienteCadastroDto.EmailXml !== "") {
                if (!ValidacoesUtils.email_ok(dadosClienteCadastroDto.EmailXml)) {
                    ret.push('E-mail (XML) inválido!');
                }
            }
        }

        return ret;
    }

    private static validarGeralPj(dadosClienteCadastroDto: DadosClienteCadastroDto, ehObrigatorio: boolean): string[] {
        let ret: string[] = new Array();

        if (ehObrigatorio) {
            let s = dadosClienteCadastroDto.Contato.trim();
            if (s === "") {
                ret.push('Informe o nome da pessoa para contato!');
            }
        }

        return ret;
    }

    private static validarRefBancaria(ref: RefBancariaDtoCliente): string[] {
        let ret: string[] = new Array();

        if (ref.Banco.trim() === "") {
            ret.push('Informe o banco no cadastro de Referência Bancária!');
        }
        if (ref.Agencia.trim() === "") {
            ret.push('Informe a agência no cadastro de Referência Bancária!');
        }
        if (ref.Conta.trim() === "") {
            ret.push('Informe o número da conta no cadastro de Referência Bancária!');
        }
        return ret;
    }

    private static verificarRefComercialDuplicada(lstRef: RefComercialDtoCliente[]): string[] {
        let ret: string[] = new Array();
        let reduced: RefComercialDtoCliente[] = new Array();

        lstRef.forEach((item) => {
            var duplicado = reduced.findIndex(redItem => {
                return item.Nome_Empresa == redItem.Nome_Empresa;
            }) > -1;

            if (!duplicado) {
                reduced.push(item);
            }
            else {
                ret.push("A Referência comercial " + item.Nome_Empresa + " já existe!");
            }
        });

        return ret;
    }

    private static validarRefComerial(ref: RefComercialDtoCliente): string[] {
        let ret: string[] = new Array();

        if (ref.Nome_Empresa.trim() == "") {
            ret.push('Informe o nome da empresa no cadastro de Referência Comercial!');
        }

        return ret;
    }

    private static validarTelefones(dadosClienteCadastroDto: DadosClienteCadastroDto, ehPf: boolean, ehObrigatorio: boolean): string[] {
        let ret: string[] = new Array();
        //começo Gabriel alterando
        //vamos verificar se os telefones estão OK!
        if (ehPf) {
            ret = this.validarTelefonesPF(dadosClienteCadastroDto, ehObrigatorio);
        }
        else {
            ret = this.validarTelefonesPJ(dadosClienteCadastroDto, ehObrigatorio);
        }
        //fim Gabriel alterando

        return ret;
    }

    private static validarTelefonesPF(dadosClienteCadastroDto: DadosClienteCadastroDto, ehObrigatorio: boolean): string[] {

        let ret: string[] = new Array();

        if (ehObrigatorio) {
            if (dadosClienteCadastroDto.TelefoneResidencial == "" && dadosClienteCadastroDto.DddResidencial == "" &&
                dadosClienteCadastroDto.Celular == "" && dadosClienteCadastroDto.DddCelular == "" &&
                dadosClienteCadastroDto.TelComercial == "" && dadosClienteCadastroDto.DddComercial == "") {
                ret.push('Preencha pelo menos um telefone!');
                return ret;
            }
        }

        if (dadosClienteCadastroDto.TelefoneResidencial != "" &&
            dadosClienteCadastroDto.DddResidencial == "") {
            ret.push('Preencha o DDD residencial!');
        }
        if (dadosClienteCadastroDto.TelefoneResidencial == "" &&
            dadosClienteCadastroDto.DddResidencial != "") {
            ret.push('Preencha o telefone residencial!');
        }
        // if (!!dadosClienteCadastroDto.TelefoneResidencial.trim() &&
        //     dadosClienteCadastroDto.TelefoneResidencial.trim().length < 6) {
        //     ret.push('Telefone Residencial inválido.')
        // }
        // if (!!dadosClienteCadastroDto.DddResidencial.trim() &&
        //     dadosClienteCadastroDto.DddResidencial.trim().length != 2) {
        //     ret.push('DDD Residencial inválido.')
        // }


        if (dadosClienteCadastroDto.Celular != "" &&
            dadosClienteCadastroDto.DddCelular == "") {
            ret.push('Preencha o DDD do celular.');
        }
        if (dadosClienteCadastroDto.Celular == "" &&
            dadosClienteCadastroDto.DddCelular != "") {
            ret.push('Preencha o número do celular.');
        }

        if (dadosClienteCadastroDto.TelComercial != "" &&
            dadosClienteCadastroDto.DddComercial == "") {
            ret.push('Preencha o DDD comercial!');
        }
        if (dadosClienteCadastroDto.TelComercial == "" &&
            dadosClienteCadastroDto.DddComercial != "") {
            ret.push('Preencha o telefone comercial!');
        }


        if (dadosClienteCadastroDto.TelComercial == "" &&
            dadosClienteCadastroDto.Ramal != "") {
            ret.push("Ramal comercial preenchido sem telefone!");
        }

        //vamos validar
        if (dadosClienteCadastroDto.DddResidencial != "" &&
            dadosClienteCadastroDto.TelefoneResidencial != "") {
            if (!FormatarTelefone.ddd_ok(dadosClienteCadastroDto.DddResidencial)) {
                ret.push('DDD residencial inválido!');
            }
            if (!FormatarTelefone.telefone_ok(dadosClienteCadastroDto.TelefoneResidencial)) {
                ret.push('Telefone residencial inválido!');
            }
        }

        if (dadosClienteCadastroDto.DddCelular != "" &&
            dadosClienteCadastroDto.Celular != "") {
            if (!FormatarTelefone.ddd_ok(dadosClienteCadastroDto.DddCelular)) {
                ret.push('DDD celular inválido!');
            }
            if (!FormatarTelefone.telefone_ok(dadosClienteCadastroDto.Celular)) {
                ret.push('Telefone celular inválido!');
            }
        }

        if (dadosClienteCadastroDto.DddComercial != "" &&
            dadosClienteCadastroDto.TelComercial != "") {
            if (!FormatarTelefone.ddd_ok(dadosClienteCadastroDto.DddComercial)) {
                ret.push('DDD comercial inválido!');
            }
            if (!FormatarTelefone.telefone_ok(dadosClienteCadastroDto.TelComercial)) {
                ret.push('Telefone comercial inválido!');
            }
        }

        return ret;
    }

    private static validarTelefonesPJ(dadosClienteCadastroDto: DadosClienteCadastroDto, ehObrigatorio: boolean): string[] {
        let ret: string[] = new Array();

        if (ehObrigatorio) {
            if (dadosClienteCadastroDto.TelComercial.trim() == "" && dadosClienteCadastroDto.DddComercial.trim() == "" &&
                dadosClienteCadastroDto.TelComercial2.trim() == "" && dadosClienteCadastroDto.DddComercial2.trim() == "") {
                ret.push('Preencha ao menos um telefone!');
                return ret;
            }
        }

        if (dadosClienteCadastroDto.TelComercial.trim() == "" &&
            dadosClienteCadastroDto.DddComercial.trim() != "") {
            ret.push('Preencha o telefone comercial!');
        }
        if (dadosClienteCadastroDto.TelComercial.trim() != "" &&
            dadosClienteCadastroDto.DddComercial.trim() == "") {
            ret.push('Preencha o DDD comercial!');
        }

        if (dadosClienteCadastroDto.TelComercial2.trim() == "" &&
            dadosClienteCadastroDto.DddComercial2.trim() != "") {
            ret.push('Preencha o telefone comercial 2!');
        }
        if (dadosClienteCadastroDto.TelComercial2.trim() != "" &&
            dadosClienteCadastroDto.DddComercial2.trim() == "") {
            ret.push('Preencha o DDD comercial 2 !');
        }

        if (dadosClienteCadastroDto.TelComercial == "" &&
            dadosClienteCadastroDto.Ramal != "") {
            ret.push("Ramal comercial preenchido sem telefone!");
        }

        if (dadosClienteCadastroDto.TelComercial2 == "" &&
            dadosClienteCadastroDto.Ramal2 != "") {
            ret.push("Ramal comercial 2 preenchido sem telefone!");
        }

        //vamos verificar se os tel comerciais estão ok
        if (dadosClienteCadastroDto.DddComercial != "" &&
            dadosClienteCadastroDto.TelComercial != "") {
            if (!FormatarTelefone.ddd_ok(dadosClienteCadastroDto.DddComercial)) {
                ret.push('DDD comercial inválido!');
            }

            if (!FormatarTelefone.telefone_ok(dadosClienteCadastroDto.TelComercial)) {
                ret.push('Telefone comercial inválido!');
            }
        }

        if (dadosClienteCadastroDto.DddComercial2 != "" &&
            dadosClienteCadastroDto.TelComercial2 != "") {
            if (!FormatarTelefone.ddd_ok(dadosClienteCadastroDto.DddComercial2)) {
                ret.push('DDD comercial 2 inválido!');
            }
            if (!FormatarTelefone.telefone_ok(dadosClienteCadastroDto.TelComercial2)) {
                ret.push('Telefone comercial 2 inválido!');
            }
        }

        return ret;
    }

    private static validarEndereco(dadosClienteCadastroDto: DadosClienteCadastroDto, lstCidadesIBGE: string[]): string[] {
        let ret: string[] = new Array();

        if (!dadosClienteCadastroDto.Endereco && dadosClienteCadastroDto.Endereco.trim() === "") {
            ret.push('Preencha o endereço!');
        }

        if (!dadosClienteCadastroDto.Numero && dadosClienteCadastroDto.Numero.trim() === "") {
            ret.push('Preencha o número do endereço!');
        }

        if (!dadosClienteCadastroDto.Bairro && dadosClienteCadastroDto.Bairro.trim() === "") {
            ret.push('Preencha o bairro!');
        }

        if (!dadosClienteCadastroDto.Cidade && dadosClienteCadastroDto.Cidade.trim() === "") {
            ret.push('Preencha a cidade!');
        }

        let s = dadosClienteCadastroDto.Uf?.trim();
        if ((!s && s === "") || (!ValidacoesUtils.uf_ok(s))) {
            ret.push('UF inválida!');
        }

        if (!dadosClienteCadastroDto.Cep && dadosClienteCadastroDto.Cep.toString().trim() === "") {
            ret.push('Informe o CEP!');
        }

        if (!dadosClienteCadastroDto.Cep && !new FormatarEndereco().cep_ok(dadosClienteCadastroDto.Cep.toString())) {
            ret.push('CEP inválido!');
        }

        //vamos verificar se tem lista de cidades do IBGE, se tiver é pq a cidade do cep não existe no IBGE
        if (!!lstCidadesIBGE && lstCidadesIBGE.length > 0) {
            //a cidade do cep não consta no cadastro do IBGE e deve ter sido alterada, então vamos comparar
            if (dadosClienteCadastroDto.Cidade.trim() !== "") {
                if (lstCidadesIBGE.indexOf(dadosClienteCadastroDto.Cidade) == -1) {
                    //não existe a cidade
                    ret.push("A cidade informada não consta no cadastro do IBGE para esse estado.");
                }
            }
        }

        return ret;
    }

    public static validarEnderecoEntrega(end: EnderecoEntregaDtoClienteCadastro, tipoCliente: string, lstCidadesIBGE: string[]): string[] {
        let ret: string[] = new Array();
        let retorno = true;
        if (end.OutroEndereco) {
            if (!end.EndEtg_cod_justificativa || end.EndEtg_cod_justificativa.trim() === "") {
                ret.push("Caso seja selecionado outro endereço, selecione a justificativa do endereço!");
                return ret;
            }
            if (tipoCliente == this.constantes.ID_PJ) {
                if (!end.EndEtg_tipo_pessoa || end.EndEtg_tipo_pessoa.trim() === "" ||
                    end.EndEtg_tipo_pessoa != this.constantes.ID_PF && end.EndEtg_tipo_pessoa != this.constantes.ID_PJ) {
                    ret.push("Necessário escolher Pessoa Jurídica ou Pessoa Física!");
                    return ret;
                }

                if (!end.EndEtg_tipo_pessoa || end.EndEtg_tipo_pessoa.trim() === "" ||
                    end.EndEtg_tipo_pessoa != this.constantes.ID_PF && end.EndEtg_tipo_pessoa != this.constantes.ID_PJ) {
                    ret.push("Necessário escolher Pessoa Jurídica ou Pessoa Física!")
                    return ret;
                }
            }

            // if (!end.EndEtg_nome || end.EndEtg_nome)

            //     if (!end.EndEtg_cep || end.EndEtg_cep.trim() === "" ||
            //         !end.EndEtg_uf || end.EndEtg_uf.trim() === "" ||
            //         !end.EndEtg_cidade || end.EndEtg_cidade.trim() === "") {
            //         ret.push("Caso seja selecionado outro endereço, informe um CEP válido!");
            //         return ret;
            //     }


            if (!end.EndEtg_endereco || end.EndEtg_endereco.trim() === "") {
                ret.push("Caso seja selecionado outro endereço, informe um endereço!");
                return ret;
            }
            //somente número, o resto é feito pelo CEP
            if (!end.EndEtg_endereco_numero || end.EndEtg_endereco_numero.trim() === "") {
                ret.push("Caso seja selecionado outro endereço, preencha o número do endereço!")
                return ret;
            }
            if (!end.EndEtg_bairro || end.EndEtg_bairro.trim() === "") {
                ret.push("Caso seja selecionado outro endereço, informe um bairro!");
                return ret;
            }
            if (!end.EndEtg_cidade || end.EndEtg_cidade.trim() === "") {
                ret.push("Caso seja selecionado outro endereço, informe uma cidade!");
                return ret;
            }

            //vamos verificar se tem lista de cidades do IBGE, se tiver é pq a cidade do cep não existe no IBGE
            if (!!lstCidadesIBGE && lstCidadesIBGE.length > 0) {
                //a cidade do cep não consta no cadastro do IBGE e deve ter sido alterada, então vamos comparar
                if (end.EndEtg_cidade.trim() !== "") {
                    if (lstCidadesIBGE.indexOf(end.EndEtg_cidade) == -1) {
                        //não existe a cidade
                        ret.push("A cidade informada não consta no cadastro do IBGE para esse estado.");
                    }
                }
            }
        }
        return ret;
    }

    private static validarProdutorRural(dadosClienteCadastroDto: DadosClienteCadastroDto): DadosClienteCadastroDto {
        let clienteCadastroUtils = this;
        //se é produtor salvamos o contribuinte

        //se não for produtor rural vamos apagar os dados


        if (dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
            if (dadosClienteCadastroDto.ProdutorRural == this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO) {
                //vamos apagar os dados de contribuinte e I.E.
                dadosClienteCadastroDto.Contribuinte_Icms_Status = this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_INICIAL;
                dadosClienteCadastroDto.Ie = "";
            }
        }

        return dadosClienteCadastroDto;
    }

    private static desconverterTelefonesEnderecoEntrega(dadosClienteCadastroDto: DadosClienteCadastroDto): DadosClienteCadastroDto {

        dadosClienteCadastroDto.TelefoneResidencial = dadosClienteCadastroDto.DddResidencial + dadosClienteCadastroDto.TelefoneResidencial;

        dadosClienteCadastroDto.Celular = dadosClienteCadastroDto.DddCelular + dadosClienteCadastroDto.Celular;

        dadosClienteCadastroDto.TelComercial = dadosClienteCadastroDto.DddComercial + dadosClienteCadastroDto.TelComercial;

        dadosClienteCadastroDto.TelComercial2 = dadosClienteCadastroDto.DddComercial2 + dadosClienteCadastroDto.TelComercial2;

        return dadosClienteCadastroDto;
    }

    private static converterTelefones(dadosClienteCadastroDto: DadosClienteCadastroDto): DadosClienteCadastroDto {

        let s = FormatarTelefone.SepararTelefone(dadosClienteCadastroDto.TelefoneResidencial);
        dadosClienteCadastroDto.TelefoneResidencial = s.Telefone;
        dadosClienteCadastroDto.DddResidencial = s.Ddd;

        s = FormatarTelefone.SepararTelefone(dadosClienteCadastroDto.Celular);
        dadosClienteCadastroDto.Celular = s.Telefone;
        dadosClienteCadastroDto.DddCelular = s.Ddd;

        s = FormatarTelefone.SepararTelefone(dadosClienteCadastroDto.TelComercial);
        dadosClienteCadastroDto.TelComercial = s.Telefone;
        dadosClienteCadastroDto.DddComercial = s.Ddd;

        s = FormatarTelefone.SepararTelefone(dadosClienteCadastroDto.TelComercial2);
        dadosClienteCadastroDto.TelComercial2 = s.Telefone;
        dadosClienteCadastroDto.DddComercial2 = s.Ddd;

        return dadosClienteCadastroDto;
    }
}
