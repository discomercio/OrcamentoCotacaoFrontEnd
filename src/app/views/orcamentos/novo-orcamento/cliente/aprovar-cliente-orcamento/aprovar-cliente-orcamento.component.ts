import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';
import { NovoOrcamentoService } from '../../novo-orcamento.service';
import { Constantes } from 'src/app/utilities/constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { ClienteCadastroUtils } from 'src/app/dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidacaoCustomizadaService } from 'src/app/utilities/validacao-customizada/validacao-customizada.service';
import { CepComponent } from 'src/app/views/cep/cep/cep.component';
import { EnderecoEntregaComponent } from 'src/app/views/cliente/endereco-entrega/endereco-entrega.component';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { EnderecoCadastralClientePrepedidoDto } from 'src/app/dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';

@Component({
  selector: 'app-aprovar-cliente-orcamento',
  templateUrl: './aprovar-cliente-orcamento.component.html',
  styleUrls: ['./aprovar-cliente-orcamento.component.scss']
})
export class AprovarClienteOrcamentoComponent implements OnInit {

  constructor(private novoOrcamentoService: NovoOrcamentoService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly validacaoCustomizadaService: ValidacaoCustomizadaService) { }

  @ViewChild("cepComponente", { static: false }) cepComponente: CepComponent;
  @ViewChild("enderecoEntrega", { static: false }) enderecoEntrega: EnderecoEntregaComponent;

  clienteCadastrado: boolean;
  carregando: boolean;
  dadosClienteCadastroDto: DadosClienteCadastroDto;
  clientePF: boolean;
  constantes = new Constantes();
  cpfCnpjUtils = new CpfCnpjUtils();
  clienteCadastroUtils = new ClienteCadastroUtils();
  enderecoCadastralCliente = new EnderecoCadastralClientePrepedidoDto();
  enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  mascaraCPFCNPJ: string;
  mascaraTelefone: string;
  formPF: FormGroup;
  formPJ: FormGroup;
  listaContribuinteICMS: any[];
  idOrcamento: number;
  bloqueioIcms: boolean;

  ngOnInit(): void {

    //VERIFICAR SE O CLIENTE EXISTE
    //SE EXISTE, vamos mostrar os dados cadastrados e esconder o campo CPF ou CNPJ 
    //SE NÃO EXISTE, vamos esconder o card dos dados cadastrados, esconder o botão de copiar os dados e mostrar o campo CPF ou CNPJ

    this.idOrcamento = Number.parseInt(this.activatedRoute.snapshot.params.id);
    if (!this.novoOrcamentoService.orcamentoCotacaoDto.id) {
      this.router.navigate(["orcamentos/aprovar-orcamento", this.idOrcamento]);
      return;
    }

    this.carregando = true;
    if (!this.novoOrcamentoService.orcamentoAprovacao.clienteCadastroDto.DadosCliente.Cnpj_Cpf) {
      this.clienteCadastrado = false;
    }
    else {
      this.clienteCadastrado = true;
      this.dadosClienteCadastroDto = this.novoOrcamentoService.orcamentoAprovacao.clienteCadastroDto.DadosCliente;
    }

    debugger;
    if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo == this.constantes.ID_PF) {
      this.clientePF = true;
      this.mascaraCPFCNPJ = StringUtils.inputMaskCPF();
    }
    else {
      this.clientePF = false;
      this.mascaraCPFCNPJ = StringUtils.inputMaskCNPJ();
      this.enderecoCadastralCliente.Endereco_contribuinte_icms_status = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.contribuinteICMS;
    }

    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.carregando = false;

    this.criarListaContrinuiteICMS();
    this.criarForm();
    this.verificarAlcadaDescontoSuperior();
    this.verificarContribuinteICMS();
  }

  criarForm() {

    if (this.clientePF) {
      //é obrigatório informar ao menos 1 telefone, vamos criar uma validação própria para isso?

      this.formPF = this.fb.group({
        nome: ["", [Validators.required, Validators.maxLength(60)]],
        cpfCnpj: ["", [Validators.required]],
        rg: [""],
        email: ["", [Validators.email, Validators.maxLength(60)]],
        emailXml: ["", [Validators.email, Validators.maxLength(60)]],
        telResidencial: [""],
        celular: [""],
        telComercial: [""],
        ramal: ["", [Validators.maxLength(4)]],
        observacao: [""]
      }, {
        validators: [
          this.validacaoCustomizadaService.cnpj_cpf_ok()
        ]
      });
      return;
    }
    this.formPJ = this.fb.group({
      razao: ["", [Validators.required, Validators.maxLength(60)]],
      cpfCnpj: ["", [Validators.required]],
      tel1: [""],
      ramal1: ["", [Validators.maxLength(4)]],
      tel2: [""],
      ramal2: ["", [Validators.maxLength(4)]],
      contato: ["", [Validators.required, Validators.maxLength(30)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(60)]],
      emailXml: ["", [Validators.email]],
      icms: [this.enderecoCadastralCliente.Endereco_contribuinte_icms_status, [Validators.required, Validators.max(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO), Validators.min(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO)]],
      inscricaoEstadual: ["", [Validators.maxLength(20)]]
    }, { validators: this.validacaoCustomizadaService.cnpj_cpf_ok() });
  }

  verificarContribuinteICMS() {
    if (!this.clientePF) {
      this.bloqueioIcms = this.verificarAlcadaDescontoSuperior();
    }
  }

  verificarAlcadaDescontoSuperior(): boolean {
    let retorno = false;
    let opcao = this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.novoOrcamentoService.orcamentoAprovacao.idOpcao)[0];
    if (opcao && opcao.id != 0) {
      let produtos = opcao.listaProdutos.filter(x => x.idOperacaoAlcadaDescontoSuperior != null && x.idOperacaoAlcadaDescontoSuperior != 0);
      if (produtos.length > 0) {
        retorno = true;
      }
    }
    return retorno;
  }

  criarListaContrinuiteICMS() {
    this.listaContribuinteICMS = [
      { label: "Não", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO },
      { label: "Sim", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM },
      { label: "Isento", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO },
    ];
  }

  cnpj_cpf_formatado(): string {
    if (!this.dadosClienteCadastroDto || !this.dadosClienteCadastroDto.Cnpj_Cpf) {
      return "";
    }
    return CpfCnpjUtils.cnpj_cpf_formata(this.dadosClienteCadastroDto.Cnpj_Cpf);
  }

  buscarContribuinteICMS() {
    if (!this.dadosClienteCadastroDto || !this.dadosClienteCadastroDto.Contribuinte_Icms_Status) {
      return "";
    }

    let contribuinte: string;
    switch (this.dadosClienteCadastroDto.Contribuinte_Icms_Status) {
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM:
        contribuinte = "Sim";
        break;
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO:
        contribuinte = "Não";
        break;
      case this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO:
        contribuinte = "Isento";
        break;
    }

    return contribuinte;
  }

  copiarDados(): void {

    this.cepComponente.Cep = this.dadosClienteCadastroDto.Cep
    this.cepComponente.Endereco = this.dadosClienteCadastroDto.Endereco;
    this.cepComponente.Numero = this.dadosClienteCadastroDto.Numero;
    this.cepComponente.Bairro = this.dadosClienteCadastroDto.Bairro;
    this.cepComponente.Cidade = this.dadosClienteCadastroDto.Cidade;
    this.cepComponente.Uf = this.dadosClienteCadastroDto.Uf;
    this.cepComponente.Complemento = this.dadosClienteCadastroDto.Complemento;
    this.cepComponente.cep_retorno = this.dadosClienteCadastroDto.Cep;

    this.enderecoCadastralCliente.Endereco_cep = this.dadosClienteCadastroDto.Cep;
    this.enderecoCadastralCliente.Endereco_logradouro = this.dadosClienteCadastroDto.Endereco;
    this.enderecoCadastralCliente.Endereco_numero = this.dadosClienteCadastroDto.Numero;
    this.enderecoCadastralCliente.Endereco_bairro = this.dadosClienteCadastroDto.Bairro;
    this.enderecoCadastralCliente.Endereco_cidade = this.dadosClienteCadastroDto.Cidade;
    this.enderecoCadastralCliente.Endereco_uf = this.dadosClienteCadastroDto.Uf;
    this.enderecoCadastralCliente.Endereco_complemento = this.dadosClienteCadastroDto.Complemento;
    this.enderecoCadastralCliente.Endereco_cnpj_cpf = this.dadosClienteCadastroDto.Cnpj_Cpf;

    this.enderecoCadastralCliente.Endereco_nome = this.dadosClienteCadastroDto.Nome;
    this.enderecoCadastralCliente.Endereco_rg = this.dadosClienteCadastroDto.Rg;
    this.enderecoCadastralCliente.Endereco_tipo_pessoa = this.dadosClienteCadastroDto.Tipo;

    this.enderecoCadastralCliente.Endereco_ddd_cel = "";
    this.enderecoCadastralCliente.Endereco_ddd_res = "";
    if (this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
      this.enderecoCadastralCliente.Endereco_tel_cel = this.dadosClienteCadastroDto.DddCelular != null ?
        this.dadosClienteCadastroDto.DddCelular + this.dadosClienteCadastroDto.Celular : "";

      this.enderecoCadastralCliente.Endereco_tel_res = this.dadosClienteCadastroDto.DddResidencial != null ?
        this.dadosClienteCadastroDto.DddResidencial + this.dadosClienteCadastroDto.TelefoneResidencial : "";
    }


    this.enderecoCadastralCliente.Endereco_ddd_com = "";
    this.enderecoCadastralCliente.Endereco_tel_com = this.dadosClienteCadastroDto.DddComercial != null && this.dadosClienteCadastroDto.TelComercial != null ?
      this.dadosClienteCadastroDto.DddComercial + this.dadosClienteCadastroDto.TelComercial : "";
    this.enderecoCadastralCliente.Endereco_ramal_com = this.dadosClienteCadastroDto.Ramal;

    this.enderecoCadastralCliente.Endereco_ddd_com_2 = "";

    this.enderecoCadastralCliente.Endereco_tel_com_2 =
      this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ && this.dadosClienteCadastroDto.DddComercial2 != null ?
        this.dadosClienteCadastroDto.DddComercial2 + this.dadosClienteCadastroDto.TelComercial2 : "";

    this.enderecoCadastralCliente.Endereco_ramal_com_2 = this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ ?
      this.dadosClienteCadastroDto.Ramal2 : "";

    this.enderecoCadastralCliente.Endereco_email = this.dadosClienteCadastroDto.Email;
    this.enderecoCadastralCliente.Endereco_email_xml = this.dadosClienteCadastroDto.EmailXml;


    this.enderecoCadastralCliente.Endereco_produtor_rural_status = this.dadosClienteCadastroDto.ProdutorRural;

    this.enderecoCadastralCliente.Endereco_contribuinte_icms_status = this.dadosClienteCadastroDto.Contribuinte_Icms_Status;

    this.enderecoCadastralCliente.Endereco_ie = this.dadosClienteCadastroDto.Ie;

    this.enderecoCadastralCliente.Endereco_contato = this.dadosClienteCadastroDto.Contato;

    this.enderecoCadastralCliente.St_memorizacao_completa_enderecos = true;

  }
}
