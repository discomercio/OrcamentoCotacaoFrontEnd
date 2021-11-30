

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Estado } from 'src/app/dto/ceps/estado';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { DatePipe } from '@angular/common';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { Constantes } from 'src/app/utilities/constantes';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';

@Component({
  selector: 'app-cadastrar-cliente',
  templateUrl: './cadastrar-cliente.component.html',
  styleUrls: ['./cadastrar-cliente.component.scss']
})
export class CadastrarClienteComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly validacaoFormGroup: ValidacaoFormularioComponent,
    private readonly usuarioService: UsuariosService,
    private readonly alertaService: AlertaService,
    private readonly cepService: CepsService,
    public readonly router: Router,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private datePipe: DatePipe,
    private readonly orcamentoService: OrcamentosService,
    private readonly autenticacaoService: AutenticacaoService) { }

  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public lstVendedores: Array<Usuario>;
  public lstVendedoresParceiros: Array<Parceiro>;
  public lstParceiro: Array<Parceiro>;
  public lstEstado: Array<Estado>;
  public desabilitado: boolean = true;
  public constantes: Constantes = new Constantes();
  tipoUsuario: number;
  checkedWhatsapp: boolean = false;


  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.tipoUsuario = this.autenticacaoService.authNomeUsuario
    this.criarForm();
    this.setarCamposCondicionais();

    this.buscarEstados();
    this.selectTipo();
    this.verificaDataValidade();
    this.novoOrcamentoService.mostrarOpcoes = false;

    if (this.tipoUsuario == this.constantes.GESTOR) {
      this.buscarVendedores();
    }
  }

  setarCamposCondicionais() {
    let usuario = new Usuario();
    usuario.nome = this.autenticacaoService._usuarioLogado;
    usuario.idVendedor = this.autenticacaoService._vendedor;
    usuario.idParceiro = this.autenticacaoService._parceiro;


    this.form.controls.Vendedor.setValue(new Usuario());
    this.form.controls.Parceiro.setValue(new Usuario());
    this.form.controls.VendedorParceiro.setValue(new Usuario());

    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      this.form.controls.Vendedor.value.nome = this.autenticacaoService._usuarioLogado;
      this.buscarParceirosPorVendedor();
    }

    if (this.tipoUsuario == this.constantes.PARCEIRO) {
      this.form.controls.Vendedor.value.nome = usuario.idVendedor;
      this.form.controls.Parceiro.value.nome = this.autenticacaoService._usuarioLogado;
      this.buscarVendedoresDoParceiro();
    }

    if (this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
      this.form.controls.Vendedor.value.nome = usuario.idVendedor;
      this.form.controls.Parceiro.value.nome = usuario.idParceiro;
      this.form.controls.VendedorParceiro.value.nome = this.autenticacaoService._usuarioLogado;
    }
  }

  buscarVendedores(): void {

    this.usuarioService.buscarVendedores().toPromise().then((r) => {
      if (r != null) {
        this.lstVendedores = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedoresDoParceiro() {
    let parceiro: string;
    parceiro = this.form.controls.Parceiro.value;
    if (!!this.form.controls.Parceiro.value.nome) {
      parceiro = this.form.controls.Parceiro.value.nome;
    }

    this.usuarioService.buscarVendedoresParceiros(parceiro).toPromise().then((r) => {
      if (r != null) {
        this.lstVendedoresParceiros = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceirosPorVendedor() {
    let vendedor: string;
    vendedor = this.form.controls.Vendedor.value.nome;

    this.usuarioService.buscarParceirosPorVendedor(vendedor).toPromise().then((r) => {
      if (r != null) {
        this.lstParceiro = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarEstados() {
    this.cepService.buscarEstados().toPromise().then((r) => {
      if (r != null) {
        this.lstEstado = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  lstTipo: SelectItem[];
  selectTipo() {
    this.lstTipo = [
      { label: "PF", value: "PF" },
      { label: "PJ", value: "PJ" }
    ]
  }

  criarForm() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto == undefined)
      this.novoOrcamentoService.criarNovo();

    let clienteOrcamentoCotacao = this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto;
    this.form = this.fb.group({
      Validade: [clienteOrcamentoCotacao.validade, [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      ObservacoesGerais: [clienteOrcamentoCotacao.observacoesGerais],
      Nome: [clienteOrcamentoCotacao.nome, [Validators.required, Validators.maxLength(60)]],
      NomeObra: [clienteOrcamentoCotacao.nomeObra],
      Vendedor: [clienteOrcamentoCotacao.vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [clienteOrcamentoCotacao.parceiro],
      Telefone: [clienteOrcamentoCotacao.telefone],
      Concorda: clienteOrcamentoCotacao.concordaWhatsapp,
      VendedorParceiro: [clienteOrcamentoCotacao.vendedorParceiro],
      Uf: [clienteOrcamentoCotacao.uf, [Validators.required, Validators.maxLength(2)]],
      Tipo: [clienteOrcamentoCotacao.tipo, [Validators.required, Validators.maxLength(2)]],
    });

    // this.verificarCamposCondicionais();
    this.verificaDataValidade();

  }

  verificarCamposCondicionais() {
    if (this.tipoUsuario != this.constantes.GESTOR) {
      this.form.controls.Vendedor.clearValidators();
    }
  }

  verificaDataValidade() {
    if (!this.form.controls.Validade.value) {
      let data = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      this.form.controls.Validade.setValue(data);
      this.form.controls.Validade.disable();
    }

    let validacaoData: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (this.novoOrcamentoService.orcamentoCotacaoDto.Validade < validacaoData) {
      this.form.controls.Validade.enable();
    }
  }

  iniciarOrcamento() {


    this.novoOrcamentoService.criarNovo();
    //this.novoOrcamentoService.criarNovoOrcamentoItem();

    //let opcoesOrcamento = new Array<OrcamentoOpcaoDto>();
    // opcoesOrcamento = this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto;


    // this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
    // this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.Validade = DataUtils.formata_formulario_date(this.form.controls.Validade.value);
    // this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto = opcoesOrcamento;

  }

  salvarOrcamento() {
    if (!this.validacaoFormGroup.validaForm(this.form))
      return;

    //let clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto(this.form.value);
    let clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    clienteOrcamentoCotacaoDto.validade = this.form.controls.Validade.value;
    clienteOrcamentoCotacaoDto.observacoesGerais = this.form.controls.ObservacoesGerais.value;
    clienteOrcamentoCotacaoDto.nome = this.form.controls.Nome.value;
    clienteOrcamentoCotacaoDto.nomeObra = this.form.controls.NomeObra.value;
    clienteOrcamentoCotacaoDto.vendedor = this.form.controls.Vendedor.value.nome;
    clienteOrcamentoCotacaoDto.email = this.form.controls.Email.value;
    clienteOrcamentoCotacaoDto.parceiro = this.form.controls.Parceiro.value.nome;
    clienteOrcamentoCotacaoDto.telefone = this.form.controls.Telefone.value;
    clienteOrcamentoCotacaoDto.concordaWhatsapp = this.checkedWhatsapp;
    clienteOrcamentoCotacaoDto.vendedorParceiro = !this.form.controls.VendedorParceiro.value ? this.form.controls.VendedorParceiro.value : this.form.controls.VendedorParceiro.value.nome;
    clienteOrcamentoCotacaoDto.uf = this.form.controls.Uf.value.uf;
    clienteOrcamentoCotacaoDto.tipo = this.form.controls.Tipo.value;

    this.orcamentoService.criarOrcamento(clienteOrcamentoCotacaoDto).toPromise().then((r) => {
      if (r == null) {
        this.alertaService.mostrarMensagem(r[0]);

        return;
      }
      this.novoOrcamentoService.mostrarOpcoes = true;
    }).catch((error) => {

      this.alertaService.mostrarErroInternet(error);
      return
    });

  }

  concordouWhatsapp() {
    if (this.checkedWhatsapp) {
      this.checkedWhatsapp = false;
      return;
    }

    this.checkedWhatsapp = true;
  }

  salvaropcao() {
  }
}
