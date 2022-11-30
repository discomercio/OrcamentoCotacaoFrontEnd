import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { MatSelect } from '@angular/material';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ClienteCadastroUtils } from 'src/app/dto/prepedido/AngularClienteCadastroUtils/ClienteCadastroUtils';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaDTOClienteCadastro';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/prepedido/ClienteCadastro/EnderecoEntregaJustificativaDto';
import { Constantes } from 'src/app/dto/prepedido/Constantes';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { FormatarTelefone, TelefoneSeparado } from 'src/app/utilities/formatarTelefone';
import { CepComponent } from '../../cliente/cep/cep/cep.component';


@Component({
  selector: 'app-confirmar-endereco',
  templateUrl: './confirmar-endereco.component.html',
  styleUrls: [
    './confirmar-endereco.component.scss',
    '../../../../estilos/endereco.scss'
  ]
})
export class ConfirmarEnderecoComponent implements OnInit {

  constructor(private readonly buscarClienteService: BuscarClienteService,
    private readonly alertaService: AlertaService) { }

  buscarClienteServiceJustificativaEndEntregaComboTemporario: EnderecoEntregaJustificativaDto[];
  ngOnInit() {
    
    //se OutroEndereco for undefined, precisamos inicializar
    if (!this.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      this.enderecoEntregaDtoClienteCadastro.OutroEndereco = false;
      this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    }

    this.buscarClienteService.JustificativaEndEntregaComboTemporario().toPromise()
      .then((r) => {
        if (r == null) {
          this.alertaService.mostrarErroInternet(r);
          return;
        }
        this.buscarClienteServiceJustificativaEndEntregaComboTemporario = r;
      }).catch((r)=>{
        this.alertaService.mostrarErroInternet(r);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      //fazendo por timeout, como em cliente-corpo.component.ts
      if (this.componenteCep)
        this.atualizarDadosEnderecoTela(this.enderecoEntregaDtoClienteCadastro);
    }, 0);

  }

  @ViewChild('mySelectProdutor', { static: false }) mySelectProdutor: MatSelect;
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

  required: boolean;
  atualizarDadosEnderecoTela(enderecoEntregaDtoClienteCadastro: EnderecoEntregaDtoClienteCadastro) {
    //precisamos fazer a busca de cep para saber se tem endereço bairro e cidade para bloquear ou não
    this.enderecoEntregaDtoClienteCadastro = enderecoEntregaDtoClienteCadastro;
    const src = this.componenteCep;
    src.cep_retorno = this.enderecoEntregaDtoClienteCadastro.EndEtg_cep;
    src.Endereco = this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco;
    src.Numero = this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_numero;
    src.Complemento = this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_complemento;
    src.Bairro = this.enderecoEntregaDtoClienteCadastro.EndEtg_bairro;
    src.Cidade = this.enderecoEntregaDtoClienteCadastro.EndEtg_cidade;
    src.Uf = this.enderecoEntregaDtoClienteCadastro.EndEtg_uf;
    src.Cep = this.enderecoEntregaDtoClienteCadastro.EndEtg_cep;
    enderecoEntregaDtoClienteCadastro.EndEtg_cod_justificativa = this.enderecoEntregaDtoClienteCadastro.EndEtg_cod_justificativa;
    this.pessoaEntregaEhPJ = this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa == this.constantes.ID_PJ ? true : false;
    this.pessoaEntregaEhPF = this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa == this.constantes.ID_PF ? true : false;

    this.RbTipoPessoa = true;

    this.enderecoEntregaDtoClienteCadastro = this.desconverterTelefonesEnderecoEntrega(enderecoEntregaDtoClienteCadastro);

    this.componenteCep.cepService.buscarCep(src.Cep, null, null, null).toPromise()
      .then((r) => {
        //recebemos um endereço
        const end = r[0];

        src.temCidade = end.Cidade == "" || !end.Cidade ? false : true;
      }).catch((r) => {
        // não fazemos nada
      });
  }



  //dados
  @Input() enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  @Input() tipoPf: boolean;
  @Input() origem:string;

  //utilitários
  public clienteCadastroUtils = new ClienteCadastroUtils();

  //precisa do static: false porque está dentro de um ngif
  @ViewChild("componenteCep", { static: false }) componenteCep: CepComponent;
  public podeAvancar(): boolean {

    return !this.componenteCep.carregando;
  }
  public prepararAvancar(): void {
    //transferimos os dados do CEP para cá
    const src = this.componenteCep;

    this.enderecoEntregaDtoClienteCadastro.OutroEndereco;

    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco = src.Endereco ? src.Endereco : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_numero = src.Numero ? src.Numero : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_complemento = src.Complemento ? src.Complemento : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_bairro = src.Bairro ? src.Bairro : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_cidade = src.Cidade ? src.Cidade : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_uf = src.Uf ? src.Uf : "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_cep = src.Cep ? src.Cep : "";
  }

  public mudarFoco(): void {
    let article = document.getElementById("article-confirmar-cliente");
    article.scrollTop = article.scrollHeight;
  }

  public voltarFoco(): void {
    let article = document.getElementById("article-confirmar-cliente");
    article.scrollTop = 0;

  }

  public mascaraTelefone = FormatarTelefone.mascaraTelefone;
  public mascaraCpf = CpfCnpjUtils.mascaraCpf;
  public mascaraCnpj = CpfCnpjUtils.mascaraCnpj;
  constantes: Constantes = new Constantes();

  inicializarCamposEndereco(enderecoEntrega: EnderecoEntregaDtoClienteCadastro) {
    if (!enderecoEntrega) return;
    //sempre volamos porque, se mudar entre PF e PJ, precisa limpar os telefones
    enderecoEntrega.EndEtg_cnpj_cpf = "";
    enderecoEntrega.EndEtg_nome = "";
    enderecoEntrega.EndEtg_cep = "";
    enderecoEntrega.EndEtg_endereco = "";
    enderecoEntrega.EndEtg_endereco_numero = "";
    enderecoEntrega.EndEtg_bairro = "";
    enderecoEntrega.EndEtg_cidade = "";
    enderecoEntrega.EndEtg_uf = "";
    enderecoEntrega.EndEtg_endereco_complemento = "";
    enderecoEntrega.EndEtg_ddd_cel = "";
    enderecoEntrega.EndEtg_tel_cel = "";
    enderecoEntrega.EndEtg_ddd_res = "";
    enderecoEntrega.EndEtg_tel_res = "";
    enderecoEntrega.EndEtg_ddd_com = "";
    enderecoEntrega.EndEtg_tel_com = "";
    enderecoEntrega.EndEtg_ramal_com = "";
    enderecoEntrega.EndEtg_ddd_com_2 = "";
    enderecoEntrega.EndEtg_tel_com_2 = "";
    enderecoEntrega.EndEtg_ramal_com_2 = "";
    enderecoEntrega.EndEtg_produtor_rural_status = 0;
    enderecoEntrega.EndEtg_contribuinte_icms_status = 0;
    enderecoEntrega.EndEtg_ie = "";
    enderecoEntrega.EndEtg_tipo_pessoa = "";
    enderecoEntrega.EndEtg_email = "";
    enderecoEntrega.EndEtg_email_xml = "";
    enderecoEntrega.EndEtg_cod_justificativa = "";
  }
  pessoaEntregaEhPJ: boolean;
  pessoaEntregaEhPF: boolean;
  RbTipoPessoa: boolean;
  PF() {
    this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    this.componenteCep.zerarCamposEndEntrega();
    this.componenteCep.cep_retorno = "";
    this.componenteCep.Cep = "";
    this.pessoaEntregaEhPF = true;
    this.pessoaEntregaEhPJ = false;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.constantes.ID_PF;
  }

  PJ() {
    this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    this.componenteCep.zerarCamposEndEntrega();
    this.componenteCep.cep_retorno = "";
    this.componenteCep.Cep = "";
    this.pessoaEntregaEhPJ = true;
    this.pessoaEntregaEhPF = false;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.constantes.ID_PJ;
  }

  converteu_tel_enderecoEntrega = false;
  public converterTelefones(enderecoEntrega: EnderecoEntregaDtoClienteCadastro): EnderecoEntregaDtoClienteCadastro {

    let s: TelefoneSeparado = new TelefoneSeparado();

    if (!!enderecoEntrega.EndEtg_tel_res) {
      s = FormatarTelefone.SepararTelefone(enderecoEntrega.EndEtg_tel_res);
      enderecoEntrega.EndEtg_tel_res = s.Telefone;
      enderecoEntrega.EndEtg_ddd_res = s.Ddd;
    }

    if (!!enderecoEntrega.EndEtg_tel_cel) {
      s = FormatarTelefone.SepararTelefone(enderecoEntrega.EndEtg_tel_cel);
      enderecoEntrega.EndEtg_tel_cel = s.Telefone;
      enderecoEntrega.EndEtg_ddd_cel = s.Ddd;
    }

    if (!!enderecoEntrega.EndEtg_tel_com) {
      s = FormatarTelefone.SepararTelefone(enderecoEntrega.EndEtg_tel_com);
      enderecoEntrega.EndEtg_tel_com = s.Telefone;
      enderecoEntrega.EndEtg_ddd_com = s.Ddd;
    }

    if (!!enderecoEntrega.EndEtg_tel_com_2) {
      s = FormatarTelefone.SepararTelefone(enderecoEntrega.EndEtg_tel_com_2);
      enderecoEntrega.EndEtg_tel_com_2 = s.Telefone;
      enderecoEntrega.EndEtg_ddd_com_2 = s.Ddd;
    }

    this.converteu_tel_enderecoEntrega = true;
    return enderecoEntrega;
  }

  public desconverterTelefonesEnderecoEntrega(enderecoEntrega: EnderecoEntregaDtoClienteCadastro): EnderecoEntregaDtoClienteCadastro {
    if (enderecoEntrega != undefined) {
      enderecoEntrega.EndEtg_tel_res = enderecoEntrega.EndEtg_ddd_res + enderecoEntrega.EndEtg_tel_res;

      enderecoEntrega.EndEtg_tel_cel = enderecoEntrega.EndEtg_ddd_cel + enderecoEntrega.EndEtg_tel_cel;

      enderecoEntrega.EndEtg_tel_com = enderecoEntrega.EndEtg_ddd_com + enderecoEntrega.EndEtg_tel_com;

      enderecoEntrega.EndEtg_tel_com_2 = enderecoEntrega.EndEtg_ddd_com_2 + enderecoEntrega.EndEtg_tel_com_2;
    }

    this.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_res = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_cel = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_ddd_com_2 = "";

    this.converteu_tel_enderecoEntrega = false;
    return enderecoEntrega;
  }
}
