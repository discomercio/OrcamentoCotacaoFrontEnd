

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { UsuarioXLoja } from 'src/app/dto/usuarios/usuario_x_loja';
import { Parceiro } from 'src/app/dto/parceiros/parceiro';
import { Estado } from 'src/app/dto/ceps/estado';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { DatePipe } from '@angular/common';
import { OrcamentoOpcaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';
import { OrcamentosService } from 'src/app/service/orcamentos/orcamentos.service';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/opcoes-orcamento-cotacao-dto';

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
    private readonly orcamentoService: OrcamentosService) { }

  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public lstVendedores: Array<UsuarioXLoja>;
  public lstVendedoresParceiros: Array<Parceiro>;
  public lstParceiro: Array<Parceiro>;
  public lstEstado: Array<Estado>;
  public desabilitado: boolean = true;

  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.buscarVendedores();
    this.buscarParceiros();
    this.buscarEstados();
    this.selectTipo();
    this.novoOrcamentoService.paraTeste = false;
  }

  buscarVendedores() {
    this.usuarioService.buscarVendedores().toPromise().then((r) => {
      if (r != null) {
        this.lstVendedores = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedoresDoParceiro() {
    this.usuarioService.buscarVendedoresParceiros().toPromise().then((r) => {
      if (r != null) {
        this.lstVendedoresParceiros = r;
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceiros() {
    if (this.form.controls.Vendedor.value) {
      let vendedor: string = this.form.controls.Vendedor.value.usuario;

      this.usuarioService.buscarParceiros().toPromise().then((r) => {
        if (r != null) {
          this.lstParceiro = r;
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
    }
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
      Nome: [clienteOrcamentoCotacao.nome, [Validators.required]],
      NomeObra: [clienteOrcamentoCotacao.nomeObra],
      Vendedor: [clienteOrcamentoCotacao.vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [clienteOrcamentoCotacao.parceiro],
      Telefone: [clienteOrcamentoCotacao.telefone],
      Concorda: [clienteOrcamentoCotacao.concorda],
      VendedorParceiro: [clienteOrcamentoCotacao.vendedorParceiro],
      Uf: [clienteOrcamentoCotacao.uf, [Validators.required]],
      Tipo: [clienteOrcamentoCotacao.tipo, [Validators.required]],
    });

    this.verificaDataValidade();

  }

  verificaDataValidade() {
    // if (!this.form.controls.Validade.value) {
    //   let data = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    //   this.form.controls.Validade.setValue(data);
    //   this.form.controls.Validade.disable();
    // }

    // let validacaoData: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // if (this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.Validade < validacaoData) {
    //   this.form.controls.Validade.enable();
    // }
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
    clienteOrcamentoCotacaoDto.parceiro = this.form.controls.Parceiro.value != null ? this.form.controls.Parceiro.value.nome : "";
    clienteOrcamentoCotacaoDto.telefone = this.form.controls.Telefone.value;
    clienteOrcamentoCotacaoDto.concorda = this.form.controls.Concorda.value;
    clienteOrcamentoCotacaoDto.vendedorParceiro = this.form.controls.VendedorParceiro.value != null ? this.form.controls.VendedorParceiro.value.nome : "";
    clienteOrcamentoCotacaoDto.uf = this.form.controls.Uf.value.uf;
    clienteOrcamentoCotacaoDto.tipo = this.form.controls.Tipo.value;

    this.orcamentoService.criarOrcamento(clienteOrcamentoCotacaoDto).toPromise().then((r) => {
      if (r == null) {
        this.alertaService.mostrarMensagem(r[0]);

        return;
      }
      this.novoOrcamentoService.paraTeste = true;
    }).catch((error) => {
      this.alertaService.mostrarErroInternet(error); return
    });

  }

  salvaropcao() {
  }
}
