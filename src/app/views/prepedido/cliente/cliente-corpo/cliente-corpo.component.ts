import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CepComponent } from '../cep/cep/cep.component';
import { MatSelect } from '@angular/material';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { EnderecoCadastralClientePrepedidoDto } from 'src/app/dto/prepedido/prepedido/EnderecoCadastralClientePrepedidoDto';
import { ClienteCadastroUtils } from 'src/app/dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { FormatarTelefone, TelefoneSeparado } from 'src/app/utilities/formatarTelefone';
import { ListaBancoDto } from 'src/app/dto/prepedido/ClienteCadastro/ListaBancoDto';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { RefBancariaDtoCliente } from 'src/app/dto/prepedido/ClienteCadastro/Referencias/RefBancariaDtoCliente';
import { RefComercialDtoCliente } from 'src/app/dto/prepedido/ClienteCadastro/Referencias/RefComercialDtoCliente';

@Component({
  selector: 'app-cliente-corpo',
  templateUrl: './cliente-corpo.component.html',
  styleUrls: ['./cliente-corpo.component.scss', '../../../../estilos/endereco.scss', '../../../../estilos/telefone.scss']
})
export class ClienteCorpoComponent implements OnInit, OnChanges {
  constructor(private readonly titleService: Title,
    private readonly buscarClienteService: BuscarClienteService,
    private readonly alertaService: AlertaService) {
  }

  @Input() mostrarEndereco = true; //ao confrimar o cliente para um pre-pedido, não queremos mostrar o endereço aqui
  @ViewChild('mySelectProdutor', { static: false }) mySelectProdutor: MatSelect;


  ngOnInit() {

    this.jaFezAfterViewInit = false;

    this.criarElementos();
    this.initEhPf();
    this.definirTitle();
    if (this.cadastrando) {
      this.buscarClienteService.listaBancosCombo().toPromise()
        .then((r) => {
          if (r === null) {
            //erro
            this.alertaService.mostrarErroInternet(r);
            return;
          }
          //cliente já existe
          this.listaBancosCombo = r;
        }).catch((r) => {
          //erro
          this.alertaService.mostrarErroInternet(r);
        });
    }


    //isso foi incluido para que funcione corretamente no  browser "EDGE"

    //   let selectProdutorRural:any = document.querySelector("#selectProdutorRural .mat-form-field-flex");      
    //   selectProdutorRural.style.display = "block";

    setTimeout(() => {
      let selectProdutorRural: any = document.querySelector("#selectProdutorRural .mat-form-field-flex");
      if (selectProdutorRural)
        selectProdutorRural.style.display = "block";
    }, 800);
  }



  public ignorarProximoEnter = false;

  keydownSelectProdutor(event: KeyboardEvent): void {
    if (event.which == 13) {
      event.cancelBubble = true;
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.mySelectProdutor.toggle();
      this.ignorarProximoEnter = true;
      document.getElementById("avancar").focus();
    }
  }

  alterarProdutorContribuinteIE(produtor: number) {
    if (produtor == this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO) {
      this.dadosClienteCadastroDto.Contribuinte_Icms_Status = 0;
      this.dadosClienteCadastroDto.Ie = "";
    }
  }

  //o dado sendo editado
  @Input() dadosClienteCadastroDto = new DadosClienteCadastroDto();
  //é o mesmo dado, mas passamos separadamente para ficar mais fácil de construir esta tela
  @Input() clienteCadastroDto = new ClienteCadastroDto();

  @Input() cadastrando = false;

  //se pode editar os campos de ICMS, produtor rural e inscrição estadual
  @Input() editarIcms = true;

  @Input() enderecoCadastralClientePrepedidoDto = new EnderecoCadastralClientePrepedidoDto();

  @Input() dadosCadastrais = true;

  criarElementos() {
    //cria os elementos vazios
    //este não podemos porque já tem o Cnpj_Cpf ao criar: this.dadosClienteCadastroDto = new DadosClienteCadastroDto();
    ClienteCadastroUtils.inicializarDadosClienteCadastroDto(this.dadosClienteCadastroDto);
    //isto não pode ser criado aqui dentro! //this.clienteCadastroDto = new ClienteCadastroDto();
    this.clienteCadastroDto.DadosCliente = this.dadosClienteCadastroDto;
    this.clienteCadastroDto.RefBancaria = new Array();
    this.clienteCadastroDto.RefComercial = new Array();
  }

  public constantes: Constantes = new Constantes();

  public DataUtilsFormatarTela = DataUtils.formatarTela;
  public clienteCadastroUtils = new ClienteCadastroUtils();
  public telefone_ddd_formata = FormatarTelefone.telefone_ddd_formata;
  //lista de bancos
  public listaBancosCombo: ListaBancoDto[];

  //para editar os telefones
  //editamos em outros campos porque usamos uma máscara
  //usando o angular2-text-mask
  public mascaraTelefone = FormatarTelefone.mascaraTelefone;


  //se estamos confirmando, o label das caixa de texto sempre fica para cima
  //se estamos cadastrando, o comportamento padrão! aparece na caixa quando está vazia e sem o foco
  public floatLabel(): string {
    if (!this.cadastrando) {
      return "always";
    }
    return "auto";
  }


  //se estamos cadastrando PF ou PJ
  //usamos uma variável fixa pq não queremos mexer nos campos quando o usuário editar o campo de CPF/CNPJ
  ehPf() {
    return this.calculadoEhPf;
  }
  private initEhPf() {
    //testamos pelo tamanho do CPF/CNPJ
    if (!this.dadosClienteCadastroDto) {
      return;
    }
    this.calculadoEhPf = false;
    if (this.dadosClienteCadastroDto.Cnpj_Cpf && StringUtils.retorna_so_digitos(this.dadosClienteCadastroDto.Cnpj_Cpf).length == 11) {
      this.calculadoEhPf = true;
    }
  }
  private calculadoEhPf = false;
  ngOnChanges(changes: SimpleChanges) {
    //precisamos disso porque ele inicializa com null
    this.initEhPf();
  }

  definirTitle() {
    //nao usamos o title pq deveriamos setar em todas as páginas!
    /*
    if (this.ehPf() && this.cadastrando) {
      this.titleService.setTitle("Cadastro - pessoa física");
    }
    if (this.ehPf() && !this.cadastrando) {
      this.titleService.setTitle("Consulta - pessoa física");
    }
    if (!this.ehPf() && this.cadastrando) {
      this.titleService.setTitle("Cadastro - pessoa jurídica");
    }
    if (!this.ehPf() && !this.cadastrando) {
      this.titleService.setTitle("Consulta - pessoa jurídica");
    }
    */
  }

  //dados para exibir
  cnpj_cpf_formatado(): string {
    if (!this.dadosClienteCadastroDto || !this.dadosClienteCadastroDto.Cnpj_Cpf) {
      return "";
    }
    return CpfCnpjUtils.cnpj_cpf_formata(this.dadosClienteCadastroDto.Cnpj_Cpf);
  }

  cnpj_cpf_formatado_enderecoCadastral(): string {
    if (!this.enderecoCadastralClientePrepedidoDto || !this.enderecoCadastralClientePrepedidoDto.Endereco_cnpj_cpf) {
      return "";
    }
    return CpfCnpjUtils.cnpj_cpf_formata(this.enderecoCadastralClientePrepedidoDto.Endereco_cnpj_cpf);
  }

  public prepararAvancarEnderecoCadastralClientePrepedidoDto(): void {
    //transferimos os dados do CEP para cá
    if (this.componenteCepDadosCadastrais != null) {

      const src = this.componenteCepDadosCadastrais;
      this.enderecoCadastralClientePrepedidoDto.Endereco_logradouro = src.Endereco ? src.Endereco : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_numero = src.Numero ? src.Numero : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_complemento = src.Complemento ? src.Complemento : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_bairro = src.Bairro ? src.Bairro : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_cidade = src.Cidade ? src.Cidade : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_uf = src.Uf ? src.Uf : "";
      this.enderecoCadastralClientePrepedidoDto.Endereco_cep = src.Cep ? src.Cep : "";
    }

  }

  copiarDadosClienteCadastro(): void {

    this.componenteCepDadosCadastrais.Cep = this.dadosClienteCadastroDto.Cep
    this.componenteCepDadosCadastrais.Endereco = this.dadosClienteCadastroDto.Endereco;
    this.componenteCepDadosCadastrais.Numero = this.dadosClienteCadastroDto.Numero;
    this.componenteCepDadosCadastrais.Bairro = this.dadosClienteCadastroDto.Bairro;
    this.componenteCepDadosCadastrais.Cidade = this.dadosClienteCadastroDto.Cidade;
    this.componenteCepDadosCadastrais.Uf = this.dadosClienteCadastroDto.Uf;
    this.componenteCepDadosCadastrais.Complemento = this.dadosClienteCadastroDto.Complemento;
    this.componenteCepDadosCadastrais.cep_retorno = this.dadosClienteCadastroDto.Cep;

    this.enderecoCadastralClientePrepedidoDto.Endereco_cep = this.dadosClienteCadastroDto.Cep;
    this.enderecoCadastralClientePrepedidoDto.Endereco_logradouro = this.dadosClienteCadastroDto.Endereco;
    this.enderecoCadastralClientePrepedidoDto.Endereco_numero = this.dadosClienteCadastroDto.Numero;
    this.enderecoCadastralClientePrepedidoDto.Endereco_bairro = this.dadosClienteCadastroDto.Bairro;
    this.enderecoCadastralClientePrepedidoDto.Endereco_cidade = this.dadosClienteCadastroDto.Cidade;
    this.enderecoCadastralClientePrepedidoDto.Endereco_uf = this.dadosClienteCadastroDto.Uf;
    this.enderecoCadastralClientePrepedidoDto.Endereco_complemento = this.dadosClienteCadastroDto.Complemento;
    this.enderecoCadastralClientePrepedidoDto.Endereco_cnpj_cpf = this.dadosClienteCadastroDto.Cnpj_Cpf;

    this.enderecoCadastralClientePrepedidoDto.Endereco_nome = this.dadosClienteCadastroDto.Nome;
    this.enderecoCadastralClientePrepedidoDto.Endereco_rg = this.dadosClienteCadastroDto.Rg;
    this.enderecoCadastralClientePrepedidoDto.Endereco_tipo_pessoa = this.dadosClienteCadastroDto.Tipo;

    this.enderecoCadastralClientePrepedidoDto.Endereco_ddd_cel = "";
    this.enderecoCadastralClientePrepedidoDto.Endereco_ddd_res = "";
    if (this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
      this.enderecoCadastralClientePrepedidoDto.Endereco_tel_cel = this.dadosClienteCadastroDto.DddCelular != null ?
        this.dadosClienteCadastroDto.DddCelular + this.dadosClienteCadastroDto.Celular : "";

      this.enderecoCadastralClientePrepedidoDto.Endereco_tel_res = this.dadosClienteCadastroDto.DddResidencial != null ?
        this.dadosClienteCadastroDto.DddResidencial + this.dadosClienteCadastroDto.TelefoneResidencial : "";
    }


    this.enderecoCadastralClientePrepedidoDto.Endereco_ddd_com = "";
    this.enderecoCadastralClientePrepedidoDto.Endereco_tel_com = this.dadosClienteCadastroDto.DddComercial != null && this.dadosClienteCadastroDto.TelComercial != null ?
      this.dadosClienteCadastroDto.DddComercial + this.dadosClienteCadastroDto.TelComercial : "";
    this.enderecoCadastralClientePrepedidoDto.Endereco_ramal_com = this.dadosClienteCadastroDto.Ramal;

    this.enderecoCadastralClientePrepedidoDto.Endereco_ddd_com_2 = "";

    this.enderecoCadastralClientePrepedidoDto.Endereco_tel_com_2 =
      this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ && this.dadosClienteCadastroDto.DddComercial2 != null ?
        this.dadosClienteCadastroDto.DddComercial2 + this.dadosClienteCadastroDto.TelComercial2 : "";

    this.enderecoCadastralClientePrepedidoDto.Endereco_ramal_com_2 = this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PJ ?
      this.dadosClienteCadastroDto.Ramal2 : "";

    this.enderecoCadastralClientePrepedidoDto.Endereco_email = this.dadosClienteCadastroDto.Email;
    this.enderecoCadastralClientePrepedidoDto.Endereco_email_xml = this.dadosClienteCadastroDto.EmailXml;


    this.enderecoCadastralClientePrepedidoDto.Endereco_produtor_rural_status = this.dadosClienteCadastroDto.ProdutorRural;

    this.enderecoCadastralClientePrepedidoDto.Endereco_contribuinte_icms_status = this.dadosClienteCadastroDto.Contribuinte_Icms_Status;

    this.enderecoCadastralClientePrepedidoDto.Endereco_ie = this.dadosClienteCadastroDto.Ie;

    this.enderecoCadastralClientePrepedidoDto.Endereco_contato = this.dadosClienteCadastroDto.Contato;

    this.enderecoCadastralClientePrepedidoDto.St_memorizacao_completa_enderecos = true;

    this.enderecoCadastralClientePrepedidoDto.Endereco_email_boleto = this.dadosClienteCadastroDto.EmailBoleto;
  }

  //somente podemos fazer a inicialização da variável depois do AfterViewInit
  private jaFezAfterViewInit = false;
  ngAfterViewInit(): void {
    this.jaFezAfterViewInit = true;

    if (this.atualizarDadosEnderecoCadastralClienteTela_Dados != null)
      this.atualizarDadosEnderecoCadastralClienteTela_Executar();
  }

  private atualizarDadosEnderecoCadastralClienteTela_Dados: EnderecoCadastralClientePrepedidoDto = null;
  public atualizarDadosEnderecoCadastralClienteTela(enderecoCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto): void {
    this.atualizarDadosEnderecoCadastralClienteTela_Dados = enderecoCadastralClientePrepedidoDto;


    if (this.jaFezAfterViewInit) {
      if (this.atualizarDadosEnderecoCadastralClienteTela_Dados != null) {
        this.atualizarDadosEnderecoCadastralClienteTela_Executar();
        this.enderecoCadastralClientePrepedidoDto = this.desconverterTelefonesEnderecoDadosCadastrais(enderecoCadastralClientePrepedidoDto);
      }
    }


    return;
  }

  public converterTelefones(endCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto): EnderecoCadastralClientePrepedidoDto {
    let s: TelefoneSeparado = new TelefoneSeparado();
    if (!!endCadastralClientePrepedidoDto.Endereco_tel_res) {
      s = FormatarTelefone.SepararTelefone(endCadastralClientePrepedidoDto.Endereco_tel_res);
      endCadastralClientePrepedidoDto.Endereco_tel_res = s.Telefone;
      endCadastralClientePrepedidoDto.Endereco_ddd_res = s.Ddd;
    }

    if (!!endCadastralClientePrepedidoDto.Endereco_tel_cel) {
      s = FormatarTelefone.SepararTelefone(endCadastralClientePrepedidoDto.Endereco_tel_cel);
      endCadastralClientePrepedidoDto.Endereco_tel_cel = s.Telefone;
      endCadastralClientePrepedidoDto.Endereco_ddd_cel = s.Ddd;
    }

    if (!!endCadastralClientePrepedidoDto.Endereco_tel_com) {
      s = FormatarTelefone.SepararTelefone(endCadastralClientePrepedidoDto.Endereco_tel_com);
      endCadastralClientePrepedidoDto.Endereco_tel_com = s.Telefone;
      endCadastralClientePrepedidoDto.Endereco_ddd_com = s.Ddd;
    }

    if (!!endCadastralClientePrepedidoDto.Endereco_tel_com_2) {
      s = FormatarTelefone.SepararTelefone(endCadastralClientePrepedidoDto.Endereco_tel_com_2);
      endCadastralClientePrepedidoDto.Endereco_tel_com_2 = s.Telefone;
      endCadastralClientePrepedidoDto.Endereco_ddd_com_2 = s.Ddd;
    }

    return endCadastralClientePrepedidoDto;
  }

  public desconverterTelefonesEnderecoDadosCadastrais(endCadastralClientePrepedidoDto: EnderecoCadastralClientePrepedidoDto): EnderecoCadastralClientePrepedidoDto {

    if (!!endCadastralClientePrepedidoDto.Endereco_ddd_res && !!endCadastralClientePrepedidoDto.Endereco_tel_res) {
      endCadastralClientePrepedidoDto.Endereco_tel_res = endCadastralClientePrepedidoDto.Endereco_ddd_res +
        endCadastralClientePrepedidoDto.Endereco_tel_res;

    }

    if (!!endCadastralClientePrepedidoDto.Endereco_ddd_cel && !!endCadastralClientePrepedidoDto.Endereco_tel_cel) {
      endCadastralClientePrepedidoDto.Endereco_tel_cel = endCadastralClientePrepedidoDto.Endereco_ddd_cel +
        endCadastralClientePrepedidoDto.Endereco_tel_cel;

    }

    if (!!endCadastralClientePrepedidoDto.Endereco_ddd_com && !!endCadastralClientePrepedidoDto.Endereco_tel_com) {
      endCadastralClientePrepedidoDto.Endereco_tel_com = endCadastralClientePrepedidoDto.Endereco_ddd_com +
        endCadastralClientePrepedidoDto.Endereco_tel_com;

    }

    if (!!endCadastralClientePrepedidoDto.Endereco_ddd_com_2 && !!endCadastralClientePrepedidoDto.Endereco_tel_com_2) {
      endCadastralClientePrepedidoDto.Endereco_tel_com_2 = endCadastralClientePrepedidoDto.Endereco_ddd_com_2 +
        endCadastralClientePrepedidoDto.Endereco_tel_com_2;

    }

    endCadastralClientePrepedidoDto.Endereco_ddd_res = "";
    endCadastralClientePrepedidoDto.Endereco_ddd_cel = "";
    endCadastralClientePrepedidoDto.Endereco_ddd_com = "";
    endCadastralClientePrepedidoDto.Endereco_ddd_com_2 = "";

    return endCadastralClientePrepedidoDto;
  }
  private atualizarDadosEnderecoCadastralClienteTela_Executar(): void {
    setTimeout(() => {

      this.enderecoCadastralClientePrepedidoDto = this.atualizarDadosEnderecoCadastralClienteTela_Dados;
      const src = this.componenteCepDadosCadastrais;
      src.cep_retorno = this.enderecoCadastralClientePrepedidoDto.Endereco_cep;
      src.Cep = this.enderecoCadastralClientePrepedidoDto.Endereco_cep;
      src.Endereco = this.enderecoCadastralClientePrepedidoDto.Endereco_logradouro;
      src.Numero = this.enderecoCadastralClientePrepedidoDto.Endereco_numero;
      src.Bairro = this.enderecoCadastralClientePrepedidoDto.Endereco_bairro;
      src.Cidade = this.enderecoCadastralClientePrepedidoDto.Endereco_cidade;
      src.Uf = this.enderecoCadastralClientePrepedidoDto.Endereco_uf;
      src.Complemento = this.enderecoCadastralClientePrepedidoDto.Endereco_complemento;

      //fazer a conversão de telefones para mostrar na tela "(xx) xxxx-xxxx"

      src.cepService.buscarCep(src.Cep, null, null, null).toPromise()
        .then((r) => {
          //recebemos um endereço
          const end = r[0];
          src.temCidade = end.Cidade == "" || !end.Cidade ? false : true;

        }).catch((r) => {
          // não fazemos nada
        });

      //nao está mais pendente
      this.atualizarDadosEnderecoCadastralClienteTela_Dados = null;
    }, 0);
  }

  //#region referencia coemrial e bancária
  adicionarRefBancaria() {
    let novo = new RefBancariaDtoCliente();
    novo.Banco = "";
    novo.BancoDescricao = "";
    novo.Agencia = "";
    novo.Conta = "";
    novo.Ddd = "";
    novo.Telefone = "";
    novo.Contato = "";

    this.clienteCadastroDto.RefBancaria.push(novo);
  }
  removerRefBancaria(indice: number) {
    this.clienteCadastroDto.RefBancaria.splice(indice, 1);
  }
  adicionarRefComercial() {
    let novo = new RefComercialDtoCliente();
    novo.Nome_Empresa = "";
    novo.Contato = "";
    novo.Ddd = "";
    novo.Telefone = "";

    this.clienteCadastroDto.RefComercial.push(novo);
  }
  removerRefComercial(indice: number) {
    this.clienteCadastroDto.RefComercial.splice(indice, 1);
  }

  //#endregion

  //#region tratamento do CEP

  //precisa do static: false porque está dentro de um ngif
  @ViewChild("componenteCep", { static: false }) componenteCep: CepComponent;
  @ViewChild("componenteCepDadosCadastrais", { static: false }) componenteCepDadosCadastrais: CepComponent;

  public podeAvancar(): boolean {
    if (this.componenteCep.telaDesktopService.carregando)
      return false;
    if (!!this.componenteCepDadosCadastrais) {
      if (this.componenteCepDadosCadastrais.telaDesktopService.carregando)
        return false;
    }


    return true;
  }
  public prepararAvancar(): void {
    //transferimos os dados do CEP para cá
    const src = this.componenteCep;

    this.dadosClienteCadastroDto.Endereco = src.Endereco ? src.Endereco : "";
    this.dadosClienteCadastroDto.Numero = src.Numero ? src.Numero : "";
    this.dadosClienteCadastroDto.Complemento = src.Complemento ? src.Complemento : "";
    this.dadosClienteCadastroDto.Bairro = src.Bairro ? src.Bairro : "";
    this.dadosClienteCadastroDto.Cidade = src.Cidade ? src.Cidade : "";
    this.dadosClienteCadastroDto.Uf = src.Uf ? src.Uf : "";
    this.dadosClienteCadastroDto.Cep = src.Cep ? src.Cep : "";
  }

  //#endregion
}
