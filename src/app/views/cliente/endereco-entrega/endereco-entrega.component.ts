import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/clientes/EnderecoEntregaJustificativaDto';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { Constantes } from 'src/app/utilities/constantes';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { ValidacaoCustomizadaService } from 'src/app/utilities/validacao-customizada/validacao-customizada.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ValidacoesClienteUtils } from 'src/app/utilities/validacoesClienteUtils';
import { CepComponent } from '../../cep/cep/cep.component';

@Component({
  selector: 'app-endereco-entrega',
  templateUrl: './endereco-entrega.component.html',
  styleUrls: ['./endereco-entrega.component.scss']
})
export class EnderecoEntregaComponent implements OnInit {

  constructor(private readonly alertaService: AlertaService,
    private readonly buscarClienteService: BuscarClienteService,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly validacaoCustomizadaService: ValidacaoCustomizadaService) { }

  @ViewChild("componenteCep", { static: false }) componenteCep: CepComponent;

  @Input() enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  @Input() tipoPf: boolean;
  @Input() loja: string;
  @Input() origem: string;
  pessoaEntregaEhPF: boolean;
  constantes: Constantes = new Constantes();
  listaOutroEndereco: EnderecoEntregaJustificativaDto[];
  listaContribuinteICMS: any[];
  listaProdutorRural: any[];
  mascaraCPF: string;
  mascaraCNPJ: string;
  mascaraTelefone: string;
  mensagemErro: string = '*Campo obrigatório';

  form: FormGroup;

  ngOnInit(): void {
    this.criarForm();
    this.mascaraCPF = StringUtils.inputMaskCPF();
    this.mascaraCNPJ = StringUtils.inputMaskCNPJ();
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarListas();
    this.buscarJustificativaEndEntregaCombo();
  }

  criarForm() {
    this.form = this.fb.group({
      justificativa: ["", [Validators.required]],
      endTipoPessoa: [null, this.tipoPf ? [] : [Validators.required, Validators.maxLength(2)]],
      endNome: [this.enderecoEntregaDtoClienteCadastro.EndEtg_nome, this.tipoPf ? [] : [Validators.required, Validators.maxLength(60)]],
      cpfCnpj: [this.enderecoEntregaDtoClienteCadastro.EndEtg_cnpj_cpf, this.tipoPf ? [] : [Validators.required]],
      endTelResidencial: [FormataTelefone.mascaraTelefone()],
      endCelular: [FormataTelefone.mascaraTelefone()],
      endTel1: [FormataTelefone.mascaraTelefone()],
      endRamal1: ["", [Validators.maxLength(4)]],
      endTel2: [FormataTelefone.mascaraTelefone()],
      endRamal2: ["", [Validators.maxLength(4)]],
      icmsEntrega: [this.tipoPf ? [] : [Validators.required, Validators.max(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO), Validators.min(this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_INICIAL)]],
      ieEndEntrega: [this.enderecoEntregaDtoClienteCadastro.EndEtg_ie]
    }, {
      validators: [
        this.validacaoCustomizadaService.cnpj_cpf_ok()
      ]
    });
  }

  criarListas() {
    this.listaContribuinteICMS = [
      { label: "Não", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO },
      { label: "Sim", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM },
      { label: "Isento", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO },
    ];

    this.listaProdutorRural = [
      { value: this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_SIM, label: 'Sim' },
      { value: this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO, label: 'Não' }
    ];

    // this.buscarJustificativaEndEntregaCombo();
  }

  buscarJustificativaEndEntregaCombo() {

    this.buscarClienteService.JustificativaEndEntregaComboTemporario(this.origem, this.loja).toPromise()
      .then((r) => {
        if (r == null) {
          this.alertaService.mostrarErroInternet(r);
          return;
        }
        this.listaOutroEndereco = r;
      }).catch((r) => {
        this.alertaService.mostrarErroInternet(r);
      });
  }

  limparCampos() {
    this.criarForm();
    // this.componenteCep.zerarCamposEndEntrega();
    // this.componenteCep.cep_retorno = "";
    // this.componenteCep.Cep = "";

    this.enderecoEntregaDtoClienteCadastro.EndEtg_cep = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_numero = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_complemento = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_bairro = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_cidade = "";
    this.enderecoEntregaDtoClienteCadastro.EndEtg_uf = "";
  }

  PF() {
    this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    this.componenteCep.zerarCamposEndEntrega();
    this.componenteCep.cep_retorno = "";
    this.componenteCep.Cep = "";
    // this.pessoaEntregaEhPF = true;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.constantes.ID_PF;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_contribuinte_icms_status = this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_INICIAL;
    this.form.controls.icmsEntrega.setValue(this.enderecoEntregaDtoClienteCadastro.EndEtg_contribuinte_icms_status);
    this.enderecoEntregaDtoClienteCadastro.EndEtg_produtor_rural_status = this.pessoaEntregaEhPF ?
      this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_NAO : this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL;
  }

  PJ() {
    this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    this.componenteCep.zerarCamposEndEntrega();
    this.componenteCep.cep_retorno = "";
    this.componenteCep.Cep = "";
    // this.pessoaEntregaEhPF = false;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.constantes.ID_PJ;
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
    if (!enderecoEntrega.EndEtg_cod_justificativa)
      enderecoEntrega.EndEtg_cod_justificativa = "";
  }

  validarForm(): boolean {
    let form = this.validacaoFormularioService.validaForm(this.form);
    let formCep = this.tipoPf ?
      this.componenteCep.validarForm() : !this.tipoPf && this.componenteCep ? this.componenteCep.validarForm() : false;

    if(!this.tipoPf && !this.pessoaEntregaEhPF){
      if(this.enderecoEntregaDtoClienteCadastro.EndEtg_contribuinte_icms_status == this.constantes.COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL){
        // this.form.controls.icmsEntrega.markAsDirty();
        this.form.controls.icmsEntrega.setErrors({required : true});
      }
    }
    if (!form || !formCep) return false;

    return true;
  }


  validarEnderecoEntrega(lstCidadeIBGE: string[]): string[] {

    this.enderecoEntregaDtoClienteCadastro.EndEtg_cep = this.componenteCep.Cep;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco = this.componenteCep.Endereco;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_numero = this.componenteCep.Numero;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_endereco_complemento = this.componenteCep.Complemento;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_bairro = this.componenteCep.Bairro;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_cidade = this.componenteCep.Cidade;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_uf = this.componenteCep.Uf;

    let validacoes: string[] = [];
    let tipoCliente = this.tipoPf ? this.constantes.ID_PF : this.constantes.ID_PJ;

    if (this.enderecoEntregaDtoClienteCadastro.OutroEndereco) {
      validacoes = validacoes.concat(ValidacoesClienteUtils.validarEnderecoEntrega(this.enderecoEntregaDtoClienteCadastro,
        tipoCliente, lstCidadeIBGE));
    }

    //Apenas para consistir que a opção da entrega foi selecionada
    if (this.enderecoEntregaDtoClienteCadastro.OutroEndereco == undefined) {
      validacoes = validacoes.concat("Informe se o endereço de entrega será o mesmo endereço do cadastro ou não!");
    }

    return validacoes;
  }
}
