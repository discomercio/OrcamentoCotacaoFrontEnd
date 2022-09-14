import { AlertaService } from './../../../components/alert-dialog/alerta.service';
import { MensagemService } from './../../../utilities/mensagem/mensagem.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CadastroDto } from 'src/app/dto/orcamentos/CadastroDto';
import { ClienteService } from 'src/app/service/cliente/cliente.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ClienteDto } from 'src/app/dto/clientes/cliente-dto';
import { ActivatedRoute, Router } from "@angular/router"
import { PrepedidoBuscarService } from 'src/app/service/prepedido/prepedido-buscar.service';
import { PrepedidoService } from 'src/app/service/prepedido/orcamento/prepedido.service';
import { Constantes } from 'src/app/utilities/constantes';
import { CepComponent } from '../../cep/cep/cep.component';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { EnderecoEntregaJustificativaDto } from 'src/app/dto/clientes/EnderecoEntregaJustificativaDto';
import { EnderecoEntregaDtoClienteCadastro } from 'src/app/dto/clientes/EnderecoEntregaDTOClienteCadastro';
import { AprovacaoPublicoService } from '../aprovacao-publico.service';

@Component({
  selector: 'app-cadastro-cliente',
  templateUrl: './cadastro-cliente.component.html',
  styleUrls: ['./cadastro-cliente.component.scss']
})

export class PublicoCadastroClienteComponent implements OnInit {

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly clienteService: ClienteService,
    private readonly prepedidoService: PrepedidoService,
    private readonly mensagemService: MensagemService,
    private readonly alertaService: AlertaService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly aprovacaoPubicoService: AprovacaoPublicoService
  ) { }

  listaSexo: any[];
  listaProdutorRural: any[];
  listaIE: any[];
  listaContribuinteICMS: any[];
  mesmoEndereco: string = "mesmo";
  clienteDto: ClienteDto = new ClienteDto();
  cadastroDto: CadastroDto = new CadastroDto();
  public form: FormGroup;
  mensagemErro: string = ''; //'Campo obrigatório!';
  dadosCliente: DadosClienteCadastroDto = new DadosClienteCadastroDto()
  TipoCliente: string;
  mascaraTelefone: string;
  mascaraCPF: string;
  // @Input() NomeCliente: string;
  // @Input() UF: string;
  // @Input() Telefone: string;
  // @Input() Email: string;
  // @Input() StEntregaImediata: string;
  // @Input() DtEntregaImediata: Date;
  enderecoEntregaDtoClienteCadastro = new EnderecoEntregaDtoClienteCadastro();

  constantes: Constantes = new Constantes();
  @ViewChild("cepComponente", { static: false }) cepComponente: CepComponent;
  @ViewChild("confirmarEndereco", { static: false }) confirmarEndereco: CepComponent;

  ngOnInit(): void {
    this.mascaraCPF = "999.999.999-99";
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();

    if (this.aprovacaoPubicoService.orcamento == undefined){
      this.router.navigate([`publico/orcamento/${this.activatedRoute.snapshot.params.guid}`]);
      return;
    }

    this.TipoCliente = this.aprovacaoPubicoService.orcamento.tipoCliente;

    this.criarListas();


    this.criarForm();
  }

  clientePF():boolean{
    if(this.TipoCliente == this.constantes.ID_PF) return true;

    return false;
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
    this.form = this.fb.group({
      nome: [this.cadastroDto.nome_razaoSocial, [Validators.required, Validators.maxLength(50)]],
      cpfCnpj: [this.cadastroDto.cpf_cnpj, [Validators.required]],
      rg: [],
      nascimento: [],
      sexo: [this.cadastroDto.sexo, [Validators.required]],
      cep: [],
      endereco: [],
      numero: [],
      complemento: [],
      bairro: [],
      cidade: [],
      uf: [],
      foneResidencial: [],
      foneCelular: [],
      foneComercial: [],
      foneRamal: [],
      texto: [],
      email: [this.cadastroDto.email, [Validators.email, Validators.maxLength(60)]],
      emailXml: [],
      produtorRural: [this.cadastroDto.produtoRural, [Validators.required]],
      fone1: [],
      fone1Ramal: [],
      fone2: [],
      fone2Ramal: [],
      icms: [],
      inscricaoEstadual: [],
      justifique: [],
      cep2: [],
      endereco2: [],
      numero2: [],
      complemento2: [],
      bairro2: [],
      cidade2: [],
      uf2: [],
      city1: [],
      city2: [],
      campos: this.fb.array([])
    });
  }



  escrevendoData(e: Event) {
    let data = (e.target as HTMLInputElement).value;

    if (data.length == 2) this.dadosCliente.Nascimento = data + "/";
    if (data.length == 5) this.dadosCliente.Nascimento = data + "/";
  }
  salvar() {
    if (!this.validacaoFormularioService.validaForm(this.form)) {
      this.alertaService.mostrarMensagem('Verifique os campos obrigatórios, destacados em vermelho.');
      return;
    }
    // this.populaTela();

    let cpfCnpj = this.form.controls.cpfCnpj.value?.replaceAll('.', '').replaceAll('-', '');

    // let cadastro = 
    //   {
    //     DadosCliente: {
    //       id: '0',
    //       nome: this.form.controls.nome.value,
    //       tipo: this.TipoCliente,
    //       cnpj_Cpf: cpfCnpj,
    //       rg: this.form.controls.rg.value,
    //       sexo: this.form.controls.sexo.value,
    //       cep: this.form.controls.cep.value,
    //       endereco: this.form.controls.endereco.value,
    //       numero: this.form.controls.numero.value,
    //       complemento: this.form.controls.complemento.value,
    //       bairro: this.form.controls.bairro.value,
    //       cidade: this.form.controls.cidade.value,
    //       uf: this.form.controls.uf.value,
    //       dddResidencial: this.form.controls.foneResidencial.value?.substring(0,2),
    //       telefoneResidencial: this.form.controls.foneResidencial.value?.substring(2, this.form.controls.foneResidencial.value.length),
    //       dddCelular: this.form.controls.foneCelular.value?.substring(0,2),
    //       celular: this.form.controls.foneCelular.value?.substring(2, this.form.controls.foneCelular.value.length),
    //       dddComercial: this.form.controls.foneComercial.value?.substring(0,2),
    //       telComercial: this.form.controls.foneComercial.value?.substring(2, this.form.controls.foneComercial.value.length),
    //       ramal: this.form.controls.foneRamal.value,
    //       observacao_Filiacao: this.form.controls.texto.value,
    //       email: this.form.controls.email.value,
    //       emailXml: this.form.controls.emailXml.value,
    //       produtorRural: this.form.controls.produtorRural.value
    //     },
    //     EnderecoCadastroClientePrepedido: {
    //       Endereco_cnpj_cpf: cpfCnpj,
    //       Endereco_nome: this.form.controls.nome.value,
    //       Endereco_tipo_pessoa: this.TipoCliente,
    //       Endereco_uf: this.form.controls.uf.value,
    //       Endereco_cep: this.form.controls.cep.value,
    //       Endereco_cidade: this.form.controls.cidade.value,
    //       Endereco_bairro: this.form.controls.bairro.value,
    //       Endereco_numero: this.form.controls.numero.value,
    //       Endereco_logradouro: this.form.controls.endereco.value,
    //       Endereco_ddd_res: this.form.controls.foneResidencial.value?.substring(0,2),
    //       Endereco_tel_res: this.form.controls.foneResidencial.value?.substring(2, this.form.controls.foneResidencial.value.length),
    //       Endereco_produtor_rural_status: this.form.controls.produtorRural.value
    //     },
    //     DetalhesPrepedido: {
    //       EntregaImediata: this.StEntregaImediata,
    //       EntregaImediataData: this.DtEntregaImediata
    //     }
    //   };

    // this.clienteService.buscarClienteOrcamento(cpfCnpj).toPromise().then((r) => {
    //   if (r == null) {

    //     this.mensagemService.showWarnViaToast('Cadastrando cliente...');
    //     this.clienteService.cadastrarClienteOrcamento(cadastro).toPromise().then((r) => {
    //       if (r != null) {
    //         if(r.DadosCliente?.id !== undefined) {
    //         this.mensagemService.showInfoViaToast('Cliente cadastrado!');
    //         cadastro.DadosCliente.id = r.DadosCliente.id;

    //           this.mensagemService.showWarnViaToast('Gerando pedido...');
    //           this.prepedidoService.cadastrarPrePedido(cadastro).toPromise().then((r) => {
    //             if (r != null) {
    //               this.mensagemService.showInfoViaToast('Pedido gerado!');
    //               this.router.navigate(['publico/cadastro-cliente-sucesso']);
    //             }
    //           });
    //         } else {this.alertaService.mostrarMensagem(r);}
    //       }
    //     });
    //   } else { 
    //     this.clienteDto = r;
    //     this.mesmoEndereco_click('mesmo');
    //     this.mensagemService.showWarnViaToast('Cliente existe!');

    //     cadastro.DadosCliente.id = r.DadosCliente.id;

    //     this.mensagemService.showWarnViaToast('Gerando pedido...');
    //     this.prepedidoService.cadastrarPrePedido(cadastro).toPromise().then((r) => {
    //       if (r != null) {
    //         this.mensagemService.showInfoViaToast('Pedido gerado!');
    //         this.router.navigate(['publico/cadastro-cliente-sucesso']);
    //       }
    //     });        
    //   }
    // });

  }

  mesmoEndereco_click(mesmoEndereco: string) {
    if (mesmoEndereco == 'mesmo') {
      this.form.controls.cep2.setValue(this.clienteDto.DadosCliente.Cep);
      this.form.controls.endereco2.setValue(this.clienteDto.DadosCliente.Endereco);
      this.form.controls.numero2.setValue(this.clienteDto.DadosCliente.Numero);
      this.form.controls.complemento2.setValue(this.clienteDto.DadosCliente.Complemento);
      this.form.controls.bairro2.setValue(this.clienteDto.DadosCliente.Bairro);
      this.form.controls.cidade2.setValue(this.clienteDto.DadosCliente.Cidade);
      this.form.controls.uf2.setValue(this.clienteDto.DadosCliente.Uf);
    } else if (mesmoEndereco == 'outro') {
      this.form.controls.cep2.setValue('');
      this.form.controls.endereco2.setValue('');
      this.form.controls.numero2.setValue('');
      this.form.controls.complemento2.setValue('');
      this.form.controls.bairro2.setValue('');
      this.form.controls.cidade2.setValue('');
      this.form.controls.uf2.setValue('');
    }
  }

  populaTela() { //PARA TESTES RAPIDOS

    // let numero = Math.floor(Math.random()*(9999-1000+1)+1000);

    // this.form.controls.nome.setValue(this.NomeCliente);
    // //  this.form.controls.cpfCnpj.setValue(cpf);
    //  this.form.controls.rg.setValue('1782702');
    //  this.form.controls.sexo.setValue('M');
    //  this.form.controls.cep.setValue('72125060');
    //  this.form.controls.endereco.setValue('QNE 1 Lote 6');
    //  this.form.controls.numero.setValue('1');
    //  this.form.controls.complemento.setValue('N/A');
    //  this.form.controls.bairro.setValue('Taguatinga Norte');
    //  this.form.controls.cidade.setValue('Brasilia');
    //  this.form.controls.uf.setValue('DF');
    //  this.form.controls.foneResidencial.setValue(this.Telefone);
    //  this.form.controls.foneCelular.setValue('61 9' + numero + '-' + numero);
    //  this.form.controls.foneComercial.setValue('61 9' + numero + '-' + numero);
    //  this.form.controls.foneRamal.setValue('130');
    //  this.form.controls.texto.setValue('Obs...');
    //  this.form.controls.email.setValue('mauro.lima@itssolucoes.com.br');
    //  this.form.controls.emailXml.setValue('<node>mauro.lima@itssolucoes.com.br</node>');
    //  this.form.controls.produtorRural.setValue('1');
  }

  cadastrar(){
    /*
    bloquear botão para não reenviar
    separar os ddd's do telefone 
    validar os dados 
      se falhar => voltar os valores de telefone???? analisar

    enviar para API - publico => cadastrarCliente
    */
  }
}

