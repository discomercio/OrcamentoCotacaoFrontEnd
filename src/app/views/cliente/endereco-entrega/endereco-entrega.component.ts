import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/clientes/EnderecoEntregaJustificativaDto';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { Constantes } from 'src/app/utilities/constantes';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { CepComponent } from '../../cep/cep/cep.component';

@Component({
  selector: 'app-endereco-entrega',
  templateUrl: './endereco-entrega.component.html',
  styleUrls: ['./endereco-entrega.component.scss']
})
export class EnderecoEntregaComponent implements OnInit {

  constructor(private readonly alertaService: AlertaService,
    private readonly buscarClienteService: BuscarClienteService) { }

  @ViewChild("componenteCep", { static: false }) componenteCep: CepComponent;

  @Input() enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();
  @Input() tipoPf: boolean;
  @Input() loja: string;
  @Input() origem: string;
  pessoaEntregaEhPF: boolean = false;
  constantes: Constantes = new Constantes();
  listaOutroEndereco: EnderecoEntregaJustificativaDto[];
  listaContribuinteICMS: any[];
  listaProdutorRural: any[];
  mascaraCPF: string;
  mascaraCNPJ: string;
  mascaraTelefone:string;
  mensagemErro: string = '*Campo obrigatório'; 

  ngOnInit(): void {
    this.mascaraCPF = "000.000.000-00";
    this.mascaraCNPJ = "00.000.000/0000-00";
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();

    this.criarListas();
    this.buscarJustificativaEndEntregaCombo();
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

  PF() {
    this.inicializarCamposEndereco(this.enderecoEntregaDtoClienteCadastro);
    this.componenteCep.zerarCamposEndEntrega();
    this.componenteCep.cep_retorno = "";
    this.componenteCep.Cep = "";
    // this.pessoaEntregaEhPF = true;
    this.enderecoEntregaDtoClienteCadastro.EndEtg_tipo_pessoa = this.constantes.ID_PF;
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
    enderecoEntrega.EndEtg_cod_justificativa = "";
  }
}
