import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
import { CepDto } from 'src/app/dto/ceps/CepDto';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';


@Component({
  selector: 'app-confirmar-endereco',
  templateUrl: './confirmar-endereco.component.html',
  styleUrls: [
    './confirmar-endereco.component.scss',
    '../../../../estilos/endereco.scss'
  ]
})
export class ConfirmarEnderecoComponent extends TelaDesktopBaseComponent implements OnInit, AfterViewInit {

  constructor(private readonly buscarClienteService: BuscarClienteService,
    private readonly alertaService: AlertaService,
    private readonly telaDesktopService: TelaDesktopService,
    public cdref: ChangeDetectorRef) {
    super(telaDesktopService)
  }

  buscarClienteServiceJustificativaEndEntregaComboTemporario: EnderecoEntregaJustificativaDto[];
  @ViewChild('mySelectProdutor', { static: false }) mySelectProdutor: MatSelect;
  //precisa do static: false porque está dentro de um ngif
  @ViewChild("componenteCep", { static: false }) componenteCep: CepComponent;
  //dados
  @Input() enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  @Input() tipoPf: boolean;
  @Input() origem: string;
  //utilitários
  public clienteCadastroUtils = new ClienteCadastroUtils();
  public ignorarProximoEnter = false;
  required: boolean;
  public mascaraTelefone = FormatarTelefone.mascaraTelefone;
  public mascaraCpf = CpfCnpjUtils.mascaraCpf;
  public mascaraCnpj = CpfCnpjUtils.mascaraCnpj;
  constantes: Constantes = new Constantes();
  pessoaEntregaEhPJ: boolean;
  pessoaEntregaEhPF: boolean;
  RbTipoPessoa: boolean;
  converteu_tel_enderecoEntrega = false;

  ngOnInit() {
    //se OutroEndereco for undefined, precisamos inicializar
    if (!this.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      this.enderecoEntregaDtoClienteCadastro.OutroEndereco = false;
      this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    }
  }

  ngAfterViewInit(): void {
    this.setarDadosEnderecoTela(this.enderecoEntregaDtoClienteCadastro);
    this.cdref.detectChanges();

    if (!this.telaDesktop) {
      setTimeout(() => {
        this.telaDesktopService.carregando = true;
        let promises: any = [this.buscarJustificativaEntrega()];
        Promise.all(promises).then((r: any) => {
          this.setarJustificativaEntrega(r[0]);
        }).catch((e) => {
          this.telaDesktopService.carregando = false;
          this.alertaService.mostrarErroInternet(e);
        }).finally(() => {
          this.telaDesktopService.carregando = false;
        });
      }, 0);
    }
  }

  setarDadosEnderecoTela(enderecoEntregaDtoClienteCadastro: EnderecoEntregaDtoClienteCadastro) {

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
  }

  buscarCep(cep: string): Promise<CepDto[]> {
    return this.componenteCep.cepService.buscarCep(cep, null, null, null).toPromise();
  }

  setarDadosCep(r: CepDto[]) {
    if (r.length > 0) {
      this.componenteCep.temCidade = r[0].Cidade == "" || !r[0].Cidade ? false : true;
    }
  }

  buscarJustificativaEntrega(): Promise<EnderecoEntregaJustificativaDto[]> {
    return this.buscarClienteService.JustificativaEndEntregaComboTemporario().toPromise();
  }

  setarJustificativaEntrega(r: EnderecoEntregaJustificativaDto[]) {
    if (r == null) {
      this.alertaService.mostrarErroInternet(r);
      return;
    }
    this.buscarClienteServiceJustificativaEndEntregaComboTemporario = r;
  }

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
  }

  public podeAvancar(): boolean {
    return !this.componenteCep.telaDesktopService.carregando;
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
