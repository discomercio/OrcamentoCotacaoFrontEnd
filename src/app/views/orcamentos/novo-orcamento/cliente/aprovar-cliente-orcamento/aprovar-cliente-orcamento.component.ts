import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
import { FormatarTelefone } from 'src/app/utilities/formatarTelefone';
import { ValidacoesClienteUtils } from 'src/app/utilities/validacoesClienteUtils';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';

@Component({
  selector: 'app-aprovar-cliente-orcamento',
  templateUrl: './aprovar-cliente-orcamento.component.html',
  styleUrls: ['./aprovar-cliente-orcamento.component.scss']
})
export class AprovarClienteOrcamentoComponent implements OnInit {

  constructor(public novoOrcamentoService: NovoOrcamentoService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly validacaoCustomizadaService: ValidacaoCustomizadaService,
    private readonly orcamentoService: OrcamentosService,
    private readonly alertaService: AlertaService,
    private readonly sweetAlertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService) { }

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
  alcadaSuperior: boolean;
  dadosCliente: DadosClienteCadastroDto = new DadosClienteCadastroDto();
  mensagemErro: string = '*Campo obrigatório';

  ngOnInit(): void {

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
      this.dadosCliente = this.novoOrcamentoService.orcamentoAprovacao.clienteCadastroDto.DadosCliente;
    }

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

    this.inicializarDadosClienteCadastroDto();
    this.criarListaContrinuiteICMS();
    this.criarForm();
    this.alcadaSuperior = this.verificarAlcadaDescontoSuperior();
    this.verificarContribuinteICMS();
    this.verificarValidacaoEmailBoleto();
  }

  inicializarDadosClienteCadastroDto() {
    this.dadosClienteCadastroDto = new DadosClienteCadastroDto();
    this.dadosClienteCadastroDto.Nome = "";
    this.dadosClienteCadastroDto.Tipo = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo;
    this.dadosClienteCadastroDto.Cnpj_Cpf = !this.clienteCadastrado ? "" : this.dadosCliente.Cnpj_Cpf;
    this.dadosClienteCadastroDto.Rg = "";
    this.dadosClienteCadastroDto.Email = "";
    this.dadosClienteCadastroDto.EmailXml = "";
    this.dadosClienteCadastroDto.DddResidencial = "";
    this.dadosClienteCadastroDto.TelefoneResidencial = "";
    this.dadosClienteCadastroDto.DddCelular = "";
    this.dadosClienteCadastroDto.Celular = "";
    this.dadosClienteCadastroDto.DddComercial = "";
    this.dadosClienteCadastroDto.TelComercial = "";
    this.dadosClienteCadastroDto.Ramal = "";
    this.dadosClienteCadastroDto.DddComercial2 = "";
    this.dadosClienteCadastroDto.TelComercial2 = "";
    this.dadosClienteCadastroDto.Ramal2 = "";
    this.dadosClienteCadastroDto.Observacao_Filiacao = "";
    this.dadosClienteCadastroDto.ProdutorRural = 0;
    this.dadosClienteCadastroDto.EmailBoleto = "";
  }

  criarForm() {

    if (this.clientePF) {
      //é obrigatório informar ao menos 1 telefone, vamos criar uma validação própria para isso?

      this.formPF = this.fb.group({
        nome: ["", [Validators.required, Validators.maxLength(60)]],
        cpfCnpj: [!this.clienteCadastrado ? "" : this.dadosCliente.Cnpj_Cpf, [Validators.required]],
        rg: [""],
        email: ["", [Validators.email, Validators.maxLength(60)]],
        emailXml: ["", [Validators.email, Validators.maxLength(60)]],
        emailBoleto: ["", [Validators.email, Validators.maxLength(60)]],
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
      cpfCnpj: [!this.clienteCadastrado ? "" : this.dadosCliente.Cnpj_Cpf, [Validators.required]],
      tel1: [""],
      ramal1: ["", [Validators.maxLength(4)]],
      tel2: [""],
      ramal2: ["", [Validators.maxLength(4)]],
      contato: ["", [Validators.required, Validators.maxLength(30)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(60)]],
      emailXml: ["", [Validators.email]],
      emailBoleto: ["", [Validators.email, Validators.maxLength(60)]],
      icms: [this.dadosCliente.Contribuinte_Icms_Status, [Validators.required, Validators.max(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO), Validators.min(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO)]],
      inscricaoEstadual: ["", [Validators.maxLength(20)]]
    }, { validators: this.validacaoCustomizadaService.cnpj_cpf_ok() });
  }

  verificarContribuinteICMS() {
    if (!this.clientePF) {
      this.dadosClienteCadastroDto.Contribuinte_Icms_Status = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.contribuinteICMS;
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

  verificarValidacaoEmailBoleto(){
    let baseOpcao = this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.filter(x => x.id == this.novoOrcamentoService.orcamentoAprovacao.idOpcao);
    if(baseOpcao.length == 0){
      this.alertaService.mostrarMensagem("Falha ao validar dados do cliente!");
      return;
    }

    let validaEmailBoleto = false;
    if(baseOpcao[0].pagtoSelecionado.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_A_VISTA){
      if(this.novoOrcamentoService.idMeioPagtoMonitorado.indexOf(`|${baseOpcao[0].pagtoSelecionado.op_av_forma_pagto}|`) > -1 || 
      this.novoOrcamentoService.idMeioPagtoMonitorado.indexOf(`|${baseOpcao[0].pagtoSelecionado.op_av_forma_pagto}|`) > -1){
        validaEmailBoleto = true;
      }
    }
    if(baseOpcao[0].pagtoSelecionado.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELADO_COM_ENTRADA){
      if(this.novoOrcamentoService.idMeioPagtoMonitorado.indexOf(`|${baseOpcao[0].pagtoSelecionado.op_pce_entrada_forma_pagto}|`) > -1 || 
      this.novoOrcamentoService.idMeioPagtoMonitorado.indexOf(`|${baseOpcao[0].pagtoSelecionado.op_pce_prestacao_forma_pagto}|`) > -1){
        validaEmailBoleto = true;
      }
    }
    if(baseOpcao[0].pagtoSelecionado.tipo_parcelamento == this.constantes.COD_FORMA_PAGTO_PARCELA_UNICA){
      if(this.novoOrcamentoService.idMeioPagtoMonitorado.indexOf(`|${baseOpcao[0].pagtoSelecionado.op_pu_forma_pagto}|`) > -1){
        validaEmailBoleto = true;
      }
    }

    if(validaEmailBoleto){
      if (this.clientePF){
        this.formPF.controls.emailBoleto.setValidators([Validators.required, Validators.email, Validators.maxLength(60)]);
      }
      else{
        this.formPJ.controls.emailBoleto.setValidators([Validators.required, Validators.email, Validators.maxLength(60)])
      }
    }
  }

  criarListaContrinuiteICMS() {
    this.listaContribuinteICMS = [
      { label: "Não", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO },
      { label: "Sim", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM },
      { label: "Isento", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO },
    ];
  }

  cnpj_cpf_formatado(): string {
    if (!this.dadosCliente || !this.dadosCliente.Cnpj_Cpf) {
      return "";
    }
    return CpfCnpjUtils.cnpj_cpf_formata(this.dadosCliente.Cnpj_Cpf);
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

    this.cepComponente.Cep = this.dadosCliente.Cep
    this.cepComponente.Endereco = this.dadosCliente.Endereco;
    this.cepComponente.Numero = this.dadosCliente.Numero;
    this.cepComponente.Bairro = this.dadosCliente.Bairro;
    this.cepComponente.Cidade = this.dadosCliente.Cidade;
    this.cepComponente.Uf = this.dadosCliente.Uf;
    this.cepComponente.Complemento = this.dadosCliente.Complemento;
    this.cepComponente.cep_retorno = this.dadosClienteCadastroDto.Cep;

    this.dadosClienteCadastroDto = Object.assign({}, this.dadosCliente);
    this.desconverterTelefones();
  }

  salvar() {

    this.carregando = true;

    if (!this.validarForms()) return;

    if (!this.validarAlcadaEUf()) return;

    this.converterTelefonesParaDadosClienteCadastroDto();
    this.dadosClienteCadastroDto.Cep = this.cepComponente.Cep;
    this.dadosClienteCadastroDto.Endereco = this.cepComponente.Endereco;
    this.dadosClienteCadastroDto.Numero = this.cepComponente.Numero;
    this.dadosClienteCadastroDto.Complemento = this.cepComponente.Complemento;
    this.dadosClienteCadastroDto.Bairro = this.cepComponente.Bairro;
    this.dadosClienteCadastroDto.Cidade = this.cepComponente.Cidade;
    this.dadosClienteCadastroDto.Uf = this.cepComponente.Uf;
    this.dadosClienteCadastroDto.ProdutorRural = this.clientePF ?
      this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO : this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL;
    this.dadosClienteCadastroDto.Indicador_Orcamentista = this.novoOrcamentoService.orcamentoCotacaoDto.parceiro;
    this.dadosClienteCadastroDto.Vendedor = this.novoOrcamentoService.orcamentoCotacaoDto.vendedor;
    this.dadosClienteCadastroDto.Loja = this.novoOrcamentoService.orcamentoCotacaoDto.loja;
    
    this.dadosClienteCadastroDto.UsuarioCadastro = `[${this.autenticacaoService._tipoUsuario}] ${this.autenticacaoService._idUsuarioLogado}`;

    if (!this.validarDadosClienteCadastro()) return;

    if (!this.clientePF && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco)
      this.converterTelefonesEnderecoEntrega();

    let aprovacaoOrcamento = new AprovacaoOrcamentoDto();
    aprovacaoOrcamento.idOrcamento = this.novoOrcamentoService.orcamentoAprovacao.idOrcamento;
    aprovacaoOrcamento.idOpcao = this.novoOrcamentoService.orcamentoAprovacao.idOpcao;
    aprovacaoOrcamento.idFormaPagto = this.novoOrcamentoService.orcamentoAprovacao.idFormaPagto;
    aprovacaoOrcamento.clienteCadastroDto = new ClienteCadastroDto();
    aprovacaoOrcamento.clienteCadastroDto.DadosCliente = JSON.parse(JSON.stringify(this.dadosClienteCadastroDto));
    aprovacaoOrcamento.enderecoEntregaDto = JSON.parse(JSON.stringify(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro));
    aprovacaoOrcamento.opcaoSequencia = this.novoOrcamentoService.orcamentoAprovacao.opcaoSequencia;
    aprovacaoOrcamento.pagtoAprovadoTexto = this.novoOrcamentoService.orcamentoAprovacao.pagtoAprovadoTexto;

    

    debugger;
    this.desconverterTelefones();
    if (!this.clientePF && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      this.desconverterTelefonesEnderecoEntrega();
    }

    this.orcamentoService.aprovarOrcamento(aprovacaoOrcamento, "interno").toPromise().then((r) => {
      if (r != null) {
        this.alertaService.mostrarMensagem(r.join("<br>"));
        this.carregando = false;
        return;
      }
      this.carregando = false;
      this.sweetAlertService.sucesso("Orçamento aprovado com sucesso!");
      this.router.navigate(["orcamentos/aprovar-orcamento", this.idOrcamento]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
      return;
    });
  }

  validarForms(): boolean {
    let formEntrega = this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco ?
      this.enderecoEntrega.validarForm() : true;
    if (this.clientePF) {
      let formPf = this.validacaoFormularioService.validaForm(this.formPF);
      let formCep = this.cepComponente.validarForm();


      if (!formPf || !formCep || !formEntrega) {
        this.carregando = false;
        return false;
      }
    }
    else {
      let formPj = this.validacaoFormularioService.validaForm(this.formPJ);
      let formCep = this.cepComponente.validarForm();

      if (!formPj || !formCep || !formEntrega) {
        this.carregando = false;
        return false;
      }
    }

    return true;
  }

  validarDadosClienteCadastro(): boolean {
    let validacoes = ValidacoesClienteUtils.ValidarDadosClienteCadastroDto(this.dadosClienteCadastroDto, null, this.clientePF, this.cepComponente.lstCidadeIBGE);

    if (validacoes.length > 0) {
      if (validacoes.length == 1) {
        this.desconverterTelefones();
        this.carregando = false;
        this.alertaService.mostrarMensagem("Lista de erros: <br>" + validacoes.join("<br>"));
        return false;
      }
    }

    if (this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      if (this.clientePF) this.passarDadosPF()

      let validacoes: string[] = [];
      validacoes = validacoes.concat(this.enderecoEntrega.validarEnderecoEntrega(this.cepComponente.lstCidadeIBGE))
      if (validacoes.length > 0) {
        this.carregando = false;
        this.alertaService.mostrarMensagem(validacoes.join("<br>"));
        return false;
      }
    }

    return true;
  }

  validarAlcadaEUf(): boolean {
    if (this.alcadaSuperior && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      if (this.enderecoEntrega.componenteCep.Uf != this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf) {
        this.alertaService.mostrarMensagem("A UF de endereço de entrega deve ser a mesma informada no orçamento!");
        this.carregando = false;
        return false;
      }
    }
    if (this.alcadaSuperior && !this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      if (this.cepComponente.Uf != this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf) {
        this.alertaService.mostrarMensagem("A UF do cadastro de cliente deve ser a mesma informada no orçamento!");
        this.carregando = false;
        return false;
      }
    }

    return true;
  }

  passarDadosPF() {
    //passar os dados caso cliente PF
    //vamos passar automático
    this.enderecoEntrega.form.controls.endNome.setValue(this.dadosClienteCadastroDto.Nome);
    this.enderecoEntrega.form.controls.cpfCnpj.setValue(this.dadosClienteCadastroDto.Cnpj_Cpf);
    this.enderecoEntrega.form.controls.icmsEntrega.setValue(1);

    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.dadosClienteCadastroDto.Tipo;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_nome = this.dadosClienteCadastroDto.Nome;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_cnpj_cpf = this.dadosClienteCadastroDto.Cnpj_Cpf;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_rg = this.dadosClienteCadastroDto.Rg;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_email = this.dadosClienteCadastroDto.Email;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_email_xml = this.dadosClienteCadastroDto.EmailXml;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_produtor_rural_status = this.dadosClienteCadastroDto.ProdutorRural;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_contribuinte_icms_status = this.dadosClienteCadastroDto.Contribuinte_Icms_Status
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ie = this.dadosClienteCadastroDto.Ie;
  }

  converterTelefonesParaDadosClienteCadastroDto() {

    let s1 = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelefoneResidencial);
    this.dadosClienteCadastroDto.TelefoneResidencial = s1.Telefone;
    this.dadosClienteCadastroDto.DddResidencial = s1.Ddd;

    let s2 = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.Celular);
    this.dadosClienteCadastroDto.Celular = s2.Telefone;
    this.dadosClienteCadastroDto.DddCelular = s2.Ddd;

    let s3 = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelComercial);
    this.dadosClienteCadastroDto.TelComercial = s3.Telefone;
    this.dadosClienteCadastroDto.DddComercial = s3.Ddd;

    let s4 = FormatarTelefone.SepararTelefone(this.dadosClienteCadastroDto.TelComercial2);
    this.dadosClienteCadastroDto.TelComercial2 = s4.Telefone;
    this.dadosClienteCadastroDto.DddComercial2 = s4.Ddd;

  }

  desconverterTelefones() {
    this.dadosClienteCadastroDto.TelefoneResidencial = this.dadosClienteCadastroDto.DddResidencial + this.dadosClienteCadastroDto.TelefoneResidencial;
    this.dadosClienteCadastroDto.Celular = this.dadosClienteCadastroDto.DddCelular + this.dadosClienteCadastroDto.Celular;
    this.dadosClienteCadastroDto.TelComercial = this.dadosClienteCadastroDto.DddComercial + this.dadosClienteCadastroDto.TelComercial;
    this.dadosClienteCadastroDto.TelComercial2 = this.dadosClienteCadastroDto.DddComercial2 + this.dadosClienteCadastroDto.TelComercial2;
  }

  converterTelefonesEnderecoEntrega() {

    let s1 = FormatarTelefone.SepararTelefone(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_res);
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_res = s1.Telefone;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_res = s1.Ddd;

    let s2 = FormatarTelefone.SepararTelefone(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_cel);
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_cel = s2.Telefone;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_cel = s2.Ddd;

    let s3 = FormatarTelefone.SepararTelefone(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com);
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com = s3.Telefone;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com = s3.Ddd;

    let s4 = FormatarTelefone.SepararTelefone(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com_2);
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com_2 = s4.Telefone;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com_2 = s4.Ddd;

  }

  desconverterTelefonesEnderecoEntrega() {
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_res =
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_res +
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_res;

    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_cel =
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_cel +
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_cel;

    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com =
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com +
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com;

    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com_2 =
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com_2 +
      this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tel_com_2;
  }

  voltar() {
    window.history.back();
  }
}
