import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentosService } from 'src/app/orcamentos/orcamentos.service';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { Constantes } from 'src/app/utilities/constantes';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';

@Component({
  selector: 'app-cadastrar-cliente',
  templateUrl: './cadastrar-cliente.component.html',
  styleUrls: ['./cadastrar-cliente.component.scss']
})

export class CadastrarClienteComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public readonly validacaoFormularioService: ValidacaoFormularioService,
    private readonly usuarioService: UsuariosService,
    private readonly alertaService: AlertaService,
    private readonly cepService: CepsService,
    public readonly router: Router,
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly orcamentoService: OrcamentosService) { }

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
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.tipoUsuario = this.autenticacaoService.tipoUsuario;
    this.buscarConfigValidade();
    this.setarCamposDoForm();
    this.carregarListas();
    this.buscarEstados();
    this.buscarTiposCliente();
    this.verificaDataValidade();

    this.novoOrcamentoService.mostrarOpcoes = false;
  }

  buscarConfigValidade() {
    this.orcamentoService.buscarConfigValidade().toPromise().then((r) => {
      if (r != null) {
        this.novoOrcamentoService.configValidade = r;
      }
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
    })
  }

  setarCamposDoForm(): void {
    this.form.controls.Vendedor.setValue("");
    this.form.controls.Parceiro.setValue("");
    this.form.controls.VendedorParceiro.setValue("");

    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      this.form.controls.Vendedor.setValue(this.usuario.nome);
      return;
    }
    if (this.tipoUsuario == this.constantes.PARCEIRO) {
      this.form.controls.Vendedor.setValue(this.usuario.idVendedor);
      this.form.controls.Parceiro.setValue(this.usuario.nome);
      return;
    }
    if (this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
      this.form.controls.Vendedor.setValue(this.usuario.idVendedor);
      this.form.controls.Parceiro.setValue(this.usuario.idParceiro);
      this.form.controls.VendedorParceiro.setValue(this.usuario.nome);
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
      if(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro){
        this.form.controls.Parceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
        this.buscarVendedoresDoParceiro();
      }
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
        this.form.controls.Vendedor.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.vendedor);
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
        this.form.controls.VendedorParceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro);
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));
  }

  buscarParceirosPorVendedor(): void {
    let vendedor: string = this.form.controls.Vendedor.value;
    let loja: string = this.usuario.loja;

    if (this.usuario.permissoes.includes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
      this.orcamentistaIndicadorService.buscarParceirosPorLoja(loja).toPromise().then((r) => {
        if (r != null) {
          this.lstParceiro = this.montarListaParaSelectItem(r);
        }
      }).catch((r) => this.alertaService.mostrarErroInternet(r));
      return;
    }

    this.orcamentistaIndicadorService.buscarParceirosPorVendedor(vendedor, loja).toPromise().then((r) => {
      if (r != null) {
        this.lstParceiro = this.montarListaParaSelectItem(r);
        this.form.controls.Parceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
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
        this.form.controls.Uf.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf);
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
    if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto == undefined)
      this.novoOrcamentoService.criarNovo();

    let clienteOrcamentoCotacao = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto;
    this.form = this.fb.group({
      Validade: [this.novoOrcamentoService.orcamentoCotacaoDto.validade, [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      ObservacoesGerais: [this.novoOrcamentoService.orcamentoCotacaoDto.observacoesGerais],
      Nome: [clienteOrcamentoCotacao.nomeCliente, [Validators.required, Validators.maxLength(60)]],
      NomeObra: [clienteOrcamentoCotacao.nomeObra],
      Vendedor: [this.novoOrcamentoService.orcamentoCotacaoDto.vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [this.novoOrcamentoService.orcamentoCotacaoDto.parceiro],
      Telefone: [clienteOrcamentoCotacao.telefone],
      Concorda: this.novoOrcamentoService.orcamentoCotacaoDto.concordaWhatsapp,
      VendedorParceiro: [this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro],
      Uf: [clienteOrcamentoCotacao.uf, [Validators.required, Validators.maxLength(2)]],
      Tipo: [clienteOrcamentoCotacao.tipo, [Validators.required, Validators.maxLength(2)]],
      EntregaImediata: [this.novoOrcamentoService.orcamentoCotacaoDto.entregaImediata ? this.novoOrcamentoService.orcamentoCotacaoDto.entregaImediata : true],
      DataEntregaImediata: [this.novoOrcamentoService.orcamentoCotacaoDto.dataEntregaImediata]
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
    let dataCliente: Date = new Date(this.novoOrcamentoService.orcamentoCotacaoDto.validade);
    if (dataCliente > validacaoData) {
      this.form.controls.Validade.setValue(dataCliente);
      this.form.controls.Validade.enable();
    }
  }

  salvarOrcamento() {

    if (!this.validacaoFormularioService.validaForm(this.form))
      return;

    if (!this.ValidaDataEntrega())
      return;

    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS) {
      if (this.form.controls.Parceiro.value == null || this.form.controls.Parceiro.value == "") {
        this.form.controls.Parceiro.setErrors({ "status": "INVALID" });
        this.form.controls.Parceiro.markAsDirty();
        return;
      }
      else { this.form.controls.Parceiro.setErrors(null); }
    }

    let clienteOrcamentoCotacaoDto = new ClienteOrcamentoCotacaoDto();
    clienteOrcamentoCotacaoDto.nomeCliente = this.form.controls.Nome.value;
    clienteOrcamentoCotacaoDto.nomeObra = this.form.controls.NomeObra.value;
    clienteOrcamentoCotacaoDto.email = this.form.controls.Email.value;
    clienteOrcamentoCotacaoDto.telefone = this.form.controls.Telefone.value;
    clienteOrcamentoCotacaoDto.uf = this.form.controls.Uf.value;
    clienteOrcamentoCotacaoDto.tipo = this.form.controls.Tipo.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;

    this.novoOrcamentoService.orcamentoCotacaoDto.id = this.novoOrcamentoService.orcamentoCotacaoDto.id;
    this.novoOrcamentoService.orcamentoCotacaoDto.validade = this.form.controls.Validade.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.observacoesGerais = this.form.controls.ObservacoesGerais.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.vendedor = this.form.controls.Vendedor.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.parceiro = this.form.controls.Parceiro.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.concordaWhatsapp = this.checkedWhatsapp;
    this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro = !this.form.controls.VendedorParceiro.value ? this.form.controls.VendedorParceiro.value : this.form.controls.VendedorParceiro.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.novoOrcamentoService.orcamentoCotacaoDto.entregaImediata = this.form.controls.EntregaImediata.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.dataEntregaImediata = this.form.controls.DataEntregaImediata.value;

    this.router.navigate(["orcamentos/itens"]);
  }

  concordouWhatsapp(): void {
    if (this.checkedWhatsapp) {
      this.checkedWhatsapp = false;
      return;
    }

    this.checkedWhatsapp = true;
  }

  dataEntrega = true;
  ValidaDataEntrega() {
    if (!this.form.controls.EntregaImediata.value && this.form.controls.DataEntregaImediata.value == null) {
      this.form.controls.DataEntregaImediata.setErrors({ "status": "INVALID" });
      this.form.controls.DataEntregaImediata.markAsDirty();
      this.dataEntrega = false;
      return false;
    }
    this.form.controls.DataEntregaImediata.setErrors(null);
    this.dataEntrega = true;
    return true;
  }
}
