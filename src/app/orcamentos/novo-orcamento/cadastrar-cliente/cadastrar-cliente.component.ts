import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ValidacaoFormularioComponent } from 'src/app/utilities/validacao-formulario/validacao-formulario.component';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { Estado } from 'src/app/dto/ceps/estado';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { Constantes } from 'src/app/utilities/constantes';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { MensagemService } from 'src/app/utilities/mensagem/mensagem.service';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';

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
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService) { }

  //uteis
  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public constantes: Constantes = new Constantes();
  checkedWhatsapp: boolean = false;
  usuario = new Usuario();

  //listas
  public lstVendedores: SelectItem[] = [];
  public lstVendedoresParceiros: SelectItem[] = [];;
  public lstParceiro: SelectItem[] = [];
  public lstEstado: SelectItem[] = [];
  lojasUsuario: SelectItem[] = [];
  lstTipo: SelectItem[];

  //controle de campos
  public desabilitado: boolean = true;

  tipoUsuario: number;//usar o do Usuario


  ngOnInit(): void {
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.criarForm();
    this.getDadosToken();
    this.setarCamposDoForm();
    this.carregarListas();
    this.buscarEstados();
    this.buscarTiposCliente();
    this.verificaDataValidade();

    this.novoOrcamentoService.mostrarOpcoes = false;
  }

  getDadosToken(): void {
    this.usuario.nome = this.autenticacaoService.authUsuario;

    if (this.usuario.nome) {
      this.usuario.permissoes = this.autenticacaoService._permissoes;
      this.usuario.idVendedor = this.autenticacaoService._vendedor;
      this.usuario.idParceiro = this.autenticacaoService._parceiro;
      this.usuario.loja = this.autenticacaoService._lojaLogado;
    }

  }

  setarCamposDoForm(): void {
    this.form.controls.Vendedor.setValue("");
    this.form.controls.Parceiro.setValue("");
    this.form.controls.VendedorParceiro.setValue("");

    this.tipoUsuario = this.constantes.GESTOR;
    return;
    // if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS)
    if (this.usuario.permissoes.includes(this.constantes.AdministradorDoModulo)) {
      this.form.controls.Vendedor.setValue(this.usuario.nome);
      this.tipoUsuario = this.constantes.VENDEDOR_UNIS;
      return;
    }
    // if (this.tipoUsuario == this.constantes.PARCEIRO)
      if (this.usuario.permissoes.includes(this.constantes.ParceiroIndicadorUsuarioMaster)) {
        this.form.controls.Vendedor.setValue(this.usuario.idVendedor);
        this.form.controls.Parceiro.setValue(this.usuario.nome);
        this.tipoUsuario = this.constantes.PARCEIRO;
        return;
      }
    // if (this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR)
      if (this.usuario.permissoes.length == 1 &&
        this.usuario.permissoes.includes(this.constantes.AcessoAoModulo)) {
        this.form.controls.Vendedor.setValue(this.usuario.idVendedor);
        this.form.controls.Parceiro.setValue(this.usuario.idParceiro);
        this.form.controls.VendedorParceiro.setValue(this.usuario.nome);
        this.tipoUsuario = this.constantes.PARCEIRO_VENDEDOR;
        return;
      }
  }

  carregarListas(): void {
    if (this.usuario.permissoes.length == 0) {
      //se tipoUsuario estiver vazia o que fazer?
      this.alertaService.mostrarMensagem("temos que logar novamente!");
      return;
    }

    if (this.tipoUsuario == this.constantes.GESTOR) {
      this.buscarVendedores();
      return;
    }
    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      this.usuario.idVendedor = this.usuario.nome;
      this.buscarParceirosPorVendedor();
      return;
    }
    if (this.tipoUsuario == this.constantes.PARCEIRO) {
      this.buscarVendedoresDoParceiro();
      return;
    }
  }

  buscarVendedores(): void {
    this.usuarioService.buscarVendedores(this.usuario.loja).toPromise().then((r) => {
      if (r != null) {
        this.lstVendedores = this.montarListaParaSelectItem(r);
        this.form.controls.Vendedor.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.vendedor);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarVendedoresDoParceiro(): void {
    let parceiro: string;
    parceiro = this.form.controls.Parceiro.value;
    if (!!this.form.controls.Parceiro.value) {
      parceiro = this.form.controls.Parceiro.value;
    }

    this.orcamentistaIndicadorVendedorService.buscarVendedoresParceiros(parceiro).toPromise().then((r) => {
      if (r != null) {
        this.lstVendedoresParceiros = this.montarListaParaSelectItem(r);
        this.form.controls.VendedorParceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.vendedorParceiro);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceirosPorVendedor(): void {
    let vendedor: string = this.form.controls.Vendedor.value;
    let loja:string = this.usuario.loja;

    this.orcamentistaIndicadorService.buscarParceirosPorVendedor(vendedor, loja).toPromise().then((r) => {
      if (r != null) {
        this.lstParceiro = this.montarListaParaSelectItem(r);
        this.form.controls.Parceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.parceiro);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  montarListaParaSelectItem(lista: Array<any>): SelectItem[] {
    let listaResponse: SelectItem[] = [];

    lista.forEach(x => {
      let item: SelectItem = { label: x.nome, value: x.nome };
      listaResponse.push(item);
    });

    return listaResponse;
  }

  buscarEstados(): void {
    this.cepService.buscarEstados().toPromise().then((r) => {
      if (r != null) {
        r.forEach(x => {
          let item: SelectItem = { label: x.uf, value: x.uf };
          this.lstEstado.push(item);
        });
        this.form.controls.Uf.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.uf);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarTiposCliente(): void {
    this.lstTipo = [
      { label: this.constantes.ID_PF, value: this.constantes.ID_PF },
      { label: this.constantes.ID_PJ, value: this.constantes.ID_PJ }
    ]
  }

  criarForm(): void {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto == undefined)
      this.novoOrcamentoService.criarNovo();

    let clienteOrcamentoCotacao = this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto;

    this.form = this.fb.group({
      Validade: [clienteOrcamentoCotacao.validade, [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      ObservacoesGerais: [clienteOrcamentoCotacao.observacoes],
      Nome: [clienteOrcamentoCotacao.nomeCliente, [Validators.required, Validators.maxLength(60)]],
      NomeObra: [clienteOrcamentoCotacao.nomeObra],
      Vendedor: [clienteOrcamentoCotacao.vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [clienteOrcamentoCotacao.parceiro],
      Telefone: [clienteOrcamentoCotacao.telefone],
      Concorda: clienteOrcamentoCotacao.concordaWhatsapp,
      VendedorParceiro: [clienteOrcamentoCotacao.vendedorParceiro],
      Uf: [clienteOrcamentoCotacao.uf, [Validators.required, Validators.maxLength(2)]],
      Tipo: [clienteOrcamentoCotacao.tipo, [Validators.required, Validators.maxLength(2)]]
    });
  }

  verificaDataValidade(): void {
    if (!this.form.controls.Validade.value) {
      let data = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      this.form.controls.Validade.setValue(data);
      this.form.controls.Validade.disable();
      return;
    }

    let validacaoData: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let dataCliente: Date = new Date(this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.validade);
    if (dataCliente > validacaoData) {
      this.form.controls.Validade.setValue(dataCliente);
      this.form.controls.Validade.enable();
    }
  }

  salvarOrcamento() {
    debugger;
    if (!this.validacaoFormGroup.validaForm(this.form))
      return;

    let clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    clienteOrcamentoCotacaoDto.id = this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto.id;
    clienteOrcamentoCotacaoDto.validade = this.form.controls.Validade.value;
    clienteOrcamentoCotacaoDto.observacoes = this.form.controls.ObservacoesGerais.value;
    clienteOrcamentoCotacaoDto.nomeCliente = this.form.controls.Nome.value;
    clienteOrcamentoCotacaoDto.nomeObra = this.form.controls.NomeObra.value;
    clienteOrcamentoCotacaoDto.vendedor = this.form.controls.Vendedor.value;
    clienteOrcamentoCotacaoDto.email = this.form.controls.Email.value;
    clienteOrcamentoCotacaoDto.parceiro = this.form.controls.Parceiro.value;
    clienteOrcamentoCotacaoDto.telefone = this.form.controls.Telefone.value;
    clienteOrcamentoCotacaoDto.concordaWhatsapp = this.checkedWhatsapp;
    clienteOrcamentoCotacaoDto.vendedorParceiro = !this.form.controls.VendedorParceiro.value ? this.form.controls.VendedorParceiro.value : this.form.controls.VendedorParceiro.value;
    clienteOrcamentoCotacaoDto.uf = this.form.controls.Uf.value;
    clienteOrcamentoCotacaoDto.tipo = this.form.controls.Tipo.value;
    clienteOrcamentoCotacaoDto.loja = this.usuario.loja;

    this.novoOrcamentoService.orcamentoCotacaoDto.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
    this.novoOrcamentoService.mostrarOpcoes = true;
  }

  concordouWhatsapp(): void {
    if (this.checkedWhatsapp) {
      this.checkedWhatsapp = false;
      return;
    }

    this.checkedWhatsapp = true;
  }
}
