import { AlertaService } from './../../../components/alert-dialog/alerta.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CadastroDto } from 'src/app/dto/orcamentos/CadastroDto';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ClienteDto } from 'src/app/dto/clientes/cliente-dto';
import { ActivatedRoute, Router } from "@angular/router"
import { Constantes } from 'src/app/utilities/constantes';
import { CepComponent } from '../../cep/cep/cep.component';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { AprovacaoPublicoService } from '../aprovacao-publico.service';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { ValidacaoCustomizadaService } from 'src/app/utilities/validacao-customizada/validacao-customizada.service';
import { ValidacoesClienteUtils } from 'src/app/utilities/validacoesClienteUtils';
import { FormatarTelefone } from 'src/app/utilities/formatarTelefone';
import { EnderecoEntregaComponent } from '../../cliente/endereco-entrega/endereco-entrega.component';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { AprovacaoOrcamentoDto } from 'src/app/dto/orcamentos/aprocao-orcamento-dto';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

@Component({
  selector: 'app-cadastro-cliente',
  templateUrl: './cadastro-cliente.component.html',
  styleUrls: ['./cadastro-cliente.component.scss']
})

export class PublicoCadastroClienteComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly alertaService: AlertaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly aprovacaoPubicoService: AprovacaoPublicoService,
    telaDesktopService: TelaDesktopService,
    private readonly validacaoCustomizadaService: ValidacaoCustomizadaService,
    private readonly orcamentoService: OrcamentosService,
    private readonly sweetalertService: SweetalertService
  ) { super(telaDesktopService); }

  @ViewChild("cepComponente", { static: false }) cepComponente: CepComponent;
  @ViewChild("enderecoEntrega", { static: false }) enderecoEntrega: EnderecoEntregaComponent;

  formPF: FormGroup;
  formPJ: FormGroup;
  fase1 = true;
  fase2 = false;
  fase1e2juntas = true;
  desabilitaBotao: boolean = false;
  carregando: boolean;
  bloqueioIcms: boolean;

  listaSexo: any[];
  listaProdutorRural: any[];
  listaIE: any[];
  listaContribuinteICMS: any[];
  mascaraTelefone: string;
  mascaraCPF: string;
  mascaraCNPJ: string;
  mensagemErro: string = '*Campo obrigatório'; //'Campo obrigatório!';
  constantes: Constantes = new Constantes();

  clienteDto: ClienteDto = new ClienteDto();
  cadastroDto: CadastroDto = new CadastroDto();
  dadosCliente: DadosClienteCadastroDto = new DadosClienteCadastroDto()
  TipoCliente: string;
  enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  idOpcao: number;
  idFormaPagto: number;
  nasc: string | Date;
  orientacaoPreenchimento: string;
  termoPrivacidade: string;
  privacidade: boolean = false;
  condicoesAnaliseCredito: string;
  condicoes: boolean = false;
  alcadaSuperior: boolean;

  ngOnInit(): void {
    this.carregando = true;
    this.mascaraCPF = StringUtils.inputMaskCPF();
    this.mascaraCNPJ = StringUtils.inputMaskCNPJ();
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();

    if (this.aprovacaoPubicoService.orcamento == undefined) {
      this.carregando = false;
      this.router.navigate([`publico/orcamento/${this.activatedRoute.snapshot.params.guid}`]);
      return;
    }
    this.activatedRoute.queryParams.subscribe(params => {
      this.idOpcao = parseInt(params.idOpcao);
      this.idFormaPagto = parseInt(params.idFormaPagto);
    });


    this.TipoCliente = this.aprovacaoPubicoService.orcamento.tipoCliente;


    this.verificarContribuinteICMS();

    this.buscarOrientacaoPreenchimento(this.aprovacaoPubicoService.orcamento.loja);
    this.buscarCondicoesAnaliseCredito(this.aprovacaoPubicoService.orcamento.loja);
    this.buscarTermoPrivacidade(this.aprovacaoPubicoService.orcamento.loja);

    this.inicializarDadosClienteCadastroDto();
    this.criarListas();
    this.criarForm();
    this.carregando = false;
  }

  ngAfterViewInit(): void {
    // this.cepComponente.verificarUF(this.verificarAlcadaDescontoSuperior(), this.aprovacaoPubicoService.orcamento.uf);
    this.alcadaSuperior = this.verificarAlcadaDescontoSuperior();
  }

  inicializarDadosClienteCadastroDto() {
    this.dadosCliente.Nome = "";
    this.dadosCliente.Tipo = this.TipoCliente;
    this.dadosCliente.Cnpj_Cpf = "";
    this.dadosCliente.Rg = "";
    this.dadosCliente.Nascimento = "";
    this.dadosCliente.Sexo = "";
    this.dadosCliente.Email = "";
    this.dadosCliente.EmailXml = "";
    this.dadosCliente.DddResidencial = "";
    this.dadosCliente.TelefoneResidencial = "";
    this.dadosCliente.DddCelular = "";
    this.dadosCliente.Celular = "";
    this.dadosCliente.DddComercial = "";
    this.dadosCliente.TelComercial = "";
    this.dadosCliente.Ramal = "";
    this.dadosCliente.DddComercial2 = "";
    this.dadosCliente.TelComercial2 = "";
    this.dadosCliente.Ramal2 = "";
    this.dadosCliente.Observacao_Filiacao = "";
    this.dadosCliente.ProdutorRural = 0;
  }

  verificarContribuinteICMS() {
    if (!this.clientePF()) {
      this.bloqueioIcms = this.verificarAlcadaDescontoSuperior();
    }
  }

  verificarAlcadaDescontoSuperior(): boolean {
    let retorno = false;
    let opcao = this.aprovacaoPubicoService.orcamento.listaOpcoes.filter(x => x.id == this.idOpcao)[0];
    if (opcao && opcao.id != 0) {
      let produtos = opcao.listaProdutos.filter(x => x.idOperacaoAlcadaDescontoSuperior != null && x.idOperacaoAlcadaDescontoSuperior != 0);
      if (produtos.length > 0) {
        retorno = true;
      }
    }
    return retorno;
  }

  clientePF(): boolean {
    if (this.TipoCliente == this.constantes.ID_PF) return true;

    return false;
  }

  buscarOrientacaoPreenchimento(loja: string): string {
    let idParam = this.clientePF() ? 29 : 30

    this.orcamentoService.buscarParametros(idParam, loja, "publico").toPromise().then((r) => {
      if (r != null) {
        this.orientacaoPreenchimento = r[0]['Valor'];
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
    return;
  }

  buscarCondicoesAnaliseCredito(loja: string): string {
    this.orcamentoService.buscarParametros(27, loja, "publico").toPromise().then((r) => {
      if (r != null) {
        this.condicoesAnaliseCredito = r[0]['Valor'].replace("<a href=","<a target=_blank href=");
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
    return;
  }

  buscarTermoPrivacidade(loja: string): string {
    this.orcamentoService.buscarParametros(28, loja, "publico").toPromise().then((r) => {
      if (r != null) {
        this.termoPrivacidade = r[0]['Valor'].replace("<a href=","<a target=_blank href=");
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    });
    return;
  }

  criarListas() {
    this.listaContribuinteICMS = [
      { label: "Não", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO },
      { label: "Sim", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM },
      { label: "Isento", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO },
    ];

    this.listaSexo = [
      { id: 'M', value: 'Masculino' },
      { id: 'F', value: 'Feminino' }
    ];

    this.listaProdutorRural = [
      { value: this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_SIM, label: 'Sim' },
      { value: this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO, label: 'Não' }
    ];

    // this.buscarJustificativaEndEntregaCombo();
  }

  criarForm() {

    if (this.clientePF()) {
      //é obrigatório informar ao menos 1 telefone, vamos criar uma validação própria para isso?

      this.formPF = this.fb.group({
        nome: ["", [Validators.required]],
        cpfCnpj: ["", [Validators.required]],
        rg: [""],
        nascimento: [],
        sexo: ["", [Validators.required]],
        email: ["", [Validators.email]],
        emailXml: ["", [Validators.email]],
        telResidencial: [""],
        celular: [""],
        telComercial: [""],
        ramal: [""],
        observacao: [""]
      }, {
        validators: [
          this.validacaoCustomizadaService.cnpj_cpf_ok(),
          this.validacaoCustomizadaService.validarNascimento()
        ]
      });
      return;
    }

    //é obrigatório informar ao menos 1 telefone, vamos criar uma validação própria para isso?
    this.formPJ = this.fb.group({
      razao: ["", [Validators.required]],
      cpfCnpj: ["", [Validators.required]],
      tel1: [""],
      ramal1: [""],
      tel2: [""],
      ramal2: [""],
      contato: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      emailXml: ["", [Validators.email]],
      icms: [this.dadosCliente.Contribuinte_Icms_Status = this.aprovacaoPubicoService.orcamento.contribuinteIcms, [Validators.required, Validators.max(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO), Validators.min(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO)]],
      inscricaoEstadual: [""]
    }, { validators: this.validacaoCustomizadaService.cnpj_cpf_ok() });
  }

  //vamos deixar aqui para o caso de precisar voltar o campo para calendário
  escrevendoData(e: Event) {
    let data = (e.target as HTMLInputElement).value;

    if (data.length == 2) this.dadosCliente.Nascimento = data + "/";
    if (data.length == 5) this.dadosCliente.Nascimento = data + "/";
  }

  validarForms(): boolean {
    let formEntrega = this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco ?
      this.enderecoEntrega.validarForm() : true;
    if (this.clientePF()) {
      let formPf = this.validacaoFormularioService.validaForm(this.formPF);
      let formCep = this.cepComponente.validarForm();


      if (!formPf || !formCep || !formEntrega) {
        this.desabilitaBotao = false;
        this.carregando = false;
        return false;
      }
    }
    else {
      let formPj = this.validacaoFormularioService.validaForm(this.formPJ);
      let formCep = this.cepComponente.validarForm();

      if (!formPj || !formCep || !formEntrega) {
        this.desabilitaBotao = false;
        this.carregando = false;
        return false;
      }
    }

    return true;
  }

  validarDadosClienteCadastro(): boolean {
    let validacoes = ValidacoesClienteUtils.ValidarDadosClienteCadastroDto(this.dadosCliente, null, this.clientePF(), this.cepComponente.lstCidadeIBGE);

    if (validacoes.length > 0) {
      if (validacoes.length == 1) {
        this.desconverterTelefones();
        this.desabilitaBotao = false;
        this.carregando = false;
        this.alertaService.mostrarMensagem("Lista de erros: <br>" + validacoes.join("<br>"));
        return false;
      }
    }

    if (this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      if (this.clientePF()) this.passarDadosPF()

      let validacoes: string[] = [];
      validacoes = validacoes.concat(this.enderecoEntrega.validarEnderecoEntrega(this.cepComponente.lstCidadeIBGE))
      if (validacoes.length > 0) {
        // this.desconverterTelefones();
        this.desabilitaBotao = false;
        this.carregando = false;
        this.alertaService.mostrarMensagem(validacoes.join("<br>"));
        return false;
      }
    }

    return true;
  }

  salvar() {

    if (!this.privacidade || !this.condicoes) {
      this.alertaService.mostrarMensagem("É necessário aceitar os termos e condições!");
      return;
    }

    this.desabilitaBotao = true;
    this.carregando = true;

    if (!this.validarForms()) return;

    if(!this.validarAlcadaEUf()) return;

    this.converterTelefonesParaDadosClienteCadastroDto();
    this.dadosCliente.Cep = this.cepComponente.Cep;
    this.dadosCliente.Endereco = this.cepComponente.Endereco;
    this.dadosCliente.Numero = this.cepComponente.Numero;
    this.dadosCliente.Complemento = this.cepComponente.Complemento;
    this.dadosCliente.Bairro = this.cepComponente.Bairro;
    this.dadosCliente.Cidade = this.cepComponente.Cidade;
    this.dadosCliente.Uf = this.cepComponente.Uf;
    this.dadosCliente.ProdutorRural = this.TipoCliente == this.constantes.ID_PF ?
      this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO : this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL;
    this.dadosCliente.Indicador_Orcamentista = this.aprovacaoPubicoService.orcamento.parceiro;
    this.dadosCliente.Vendedor = this.aprovacaoPubicoService.orcamento.vendedor;
    this.dadosCliente.Loja = this.aprovacaoPubicoService.orcamento.loja;

    // this.dadosCliente.UsuarioCadastro = this.aprovacaoPubicoService.BuscaDonoOrcamento();
    this.dadosCliente.UsuarioCadastro = this.constantes.USUARIO_CADASTRO_CLIENTE;
    if (this.TipoCliente == this.constantes.ID_PF) {
      this.dadosCliente.Nascimento = this.nasc ?
        DataUtils.formata_dataString_para_formato_data(this.nasc.toLocaleString("pt-br")) : null;
    }

    if (!this.validarDadosClienteCadastro()) return;

    if (this.TipoCliente == this.constantes.ID_PJ && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco)
      this.converterTelefonesEnderecoEntrega();

    let aprovacaoOrcamento = new AprovacaoOrcamentoDto();
    aprovacaoOrcamento.idOrcamento = this.aprovacaoPubicoService.orcamento.id;
    aprovacaoOrcamento.idOpcao = this.idOpcao;
    aprovacaoOrcamento.guid = this.activatedRoute.snapshot.params.guid;
    aprovacaoOrcamento.idFormaPagto = this.idFormaPagto;
    aprovacaoOrcamento.clienteCadastroDto = new ClienteCadastroDto();
    aprovacaoOrcamento.clienteCadastroDto.DadosCliente = JSON.parse(JSON.stringify(this.dadosCliente));
    aprovacaoOrcamento.enderecoEntregaDto = JSON.parse(JSON.stringify(this.enderecoEntrega.enderecoEntregaDtoClienteCadastro));

    this.desconverterTelefones();
    if (this.TipoCliente == this.constantes.ID_PJ && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      this.desconverterTelefonesEnderecoEntrega();
    }
    

    this.orcamentoService.aprovarOrcamento(aprovacaoOrcamento, "publico").toPromise().then((r) => {
      //tem mensagem de erro ?
      if (r != null) {
        this.alertaService.mostrarMensagem(r.join("<br>"));
        this.carregando = false;
        this.desabilitaBotao = false;
        return;
      }
      this.carregando = false;
      this.desabilitaBotao = false;
      this.sweetalertService.sucesso("Orçamento aprovado com sucesso!");
      this.router.navigate([`publico/orcamento/${this.activatedRoute.snapshot.params.guid}`]);
    }).catch((e) => {
      this.desabilitaBotao = false;
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
      return;
    });

  }

  validarAlcadaEUf():boolean{
    if (this.alcadaSuperior && this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      if (this.enderecoEntrega.componenteCep.Uf != this.aprovacaoPubicoService.orcamento.uf) {
        this.alertaService.mostrarMensagem("A UF de endereço de entrega deve ser a mesma informada no orçamento!");
        this.carregando = false;
        this.desabilitaBotao = false;
        return false;
      }
    }
    if (this.alcadaSuperior && !this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.OutroEndereco){
      if (this.cepComponente.Uf != this.aprovacaoPubicoService.orcamento.uf) {
        this.alertaService.mostrarMensagem("A UF do cadastro de cliente deve ser a mesma informada no orçamento!");
        this.carregando = false;
        this.desabilitaBotao = false;
        return false;
      }
    }

    return true;
  }

  passarDadosPF() {
    //passar os dados caso cliente PF
    //vamos passar automático
    this.enderecoEntrega.form.controls.endNome.setValue(this.dadosCliente.Nome);
    this.enderecoEntrega.form.controls.cpfCnpj.setValue(this.dadosCliente.Cnpj_Cpf);
    this.enderecoEntrega.form.controls.icmsEntrega.setValue(1);

    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.TipoCliente;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_nome = this.dadosCliente.Nome;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_cnpj_cpf = this.dadosCliente.Cnpj_Cpf;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_rg = this.dadosCliente.Rg;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_email = this.dadosCliente.Email;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_email_xml = this.dadosCliente.EmailXml;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_produtor_rural_status = this.dadosCliente.ProdutorRural;
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_contribuinte_icms_status = this.dadosCliente.Contribuinte_Icms_Status
    this.enderecoEntrega.enderecoEntregaDtoClienteCadastro.EndEtg_ie = this.dadosCliente.Ie;
  }

  converterTelefonesParaDadosClienteCadastroDto() {

    let s1 = FormatarTelefone.SepararTelefone(this.dadosCliente.TelefoneResidencial);
    this.dadosCliente.TelefoneResidencial = s1.Telefone;
    this.dadosCliente.DddResidencial = s1.Ddd;

    let s2 = FormatarTelefone.SepararTelefone(this.dadosCliente.Celular);
    this.dadosCliente.Celular = s2.Telefone;
    this.dadosCliente.DddCelular = s2.Ddd;

    let s3 = FormatarTelefone.SepararTelefone(this.dadosCliente.TelComercial);
    this.dadosCliente.TelComercial = s3.Telefone;
    this.dadosCliente.DddComercial = s3.Ddd;

    let s4 = FormatarTelefone.SepararTelefone(this.dadosCliente.TelComercial2);
    this.dadosCliente.TelComercial2 = s4.Telefone;
    this.dadosCliente.DddComercial2 = s4.Ddd;

  }

  desconverterTelefones() {
    this.dadosCliente.TelefoneResidencial = this.dadosCliente.DddResidencial + this.dadosCliente.TelefoneResidencial;
    this.dadosCliente.Celular = this.dadosCliente.DddCelular + this.dadosCliente.Celular;
    this.dadosCliente.TelComercial = this.dadosCliente.DddComercial + this.dadosCliente.TelComercial;
    this.dadosCliente.TelComercial2 = this.dadosCliente.DddComercial2 + this.dadosCliente.TelComercial2;
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

}
