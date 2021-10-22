

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
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { DatePipe } from '@angular/common';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';

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
    private datePipe: DatePipe) { }

  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public lstVendedores: Array<UsuarioXLoja>;
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
  }

  buscarVendedores() {
    this.usuarioService.buscarVendedores().toPromise().then((r) => {
      if (r != null) {
        this.lstVendedores = r.filter((item, i, arr) => arr.findIndex((f) => f.usuario === item.usuario) === i);
      }
    });
  }

  buscarParceiros() {
    if (this.form.controls.Vendedor.value) {
      let vendedor: string = this.form.controls.Vendedor.value.usuario;

      this.usuarioService.buscarParceiros().toPromise().then((r) => {
        if (r != null) {
          this.lstParceiro = r.filter(parca => parca.vendedor === vendedor);
        }
      });
    }
  }

  buscarEstados() {
    this.cepService.buscarEstados().toPromise().then((r) => {
      if (r != null) {
        this.lstEstado = r;
      }
    })
  }

  lstTipo: SelectItem[];
  selectTipo() {
    this.lstTipo = [
      { label: "PF", value: { id: 1, name: "PF" } },
      { label: "PJ", value: { id: 2, name: "PJ" } }
    ]
  }

  criarForm() {
    if (this.novoOrcamentoService.orcamentoCotacaoDto == undefined)
      this.novoOrcamentoService.criarNovo();

    let clienteOrcamentoCotacao = this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ClienteOrcamentoCotacaoDto;
    this.form = this.fb.group({
      Nome: [clienteOrcamentoCotacao.Nome, [Validators.required]],
      NomeObra: [clienteOrcamentoCotacao.NomeObra],
      Vendedor: [clienteOrcamentoCotacao.Vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.Email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [clienteOrcamentoCotacao.Parceiro],
      Telefone: [clienteOrcamentoCotacao.Telefone],
      Concorda: [clienteOrcamentoCotacao.Concorda],
      Validade: [clienteOrcamentoCotacao.Validade, [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      VendedorParceiro: [clienteOrcamentoCotacao.VendedorParceiro],
      Uf: [clienteOrcamentoCotacao.Uf, [Validators.required]],
      Tipo: [clienteOrcamentoCotacao.Tipo, [Validators.required]]
    });

    this.verificaDataValidade();

  }

  verificaDataValidade() {
    if (!this.form.controls.Validade.value) {
      let data = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      this.form.controls.Validade.setValue(this.datePipe.transform(data, "yyyy-MM-dd"));
      this.form.controls.Validade.disable();
    }

    let validacaoData: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.Validade < validacaoData) {
      this.form.controls.Validade.enable();
    }
  }

  iniciarOrcamento() {
    let listaOpOrcamento = new Array<OrcamentoCotacaoDto>();
    listaOpOrcamento = this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto;
    
    this.novoOrcamentoService.criarNovo();
    this.novoOrcamentoService.criarNovoOrcamentoItem();
    let clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto(this.form.value);

    this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
    this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.Validade = DataUtils.formata_formulario_date(this.form.controls.Validade.value);
    this.novoOrcamentoService.opcoesOrcamentoCotacaoDto.ListaOrcamentoCotacaoDto = listaOpOrcamento;
    this.router.navigate(['novo-orcamento/itens']);
  }
}
