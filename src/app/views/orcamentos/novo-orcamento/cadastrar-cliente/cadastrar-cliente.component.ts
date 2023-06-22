import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { NovoOrcamentoService } from '../novo-orcamento.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';
import { Constantes } from 'src/app/utilities/constantes';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { OrcamentistaIndicadorVendedorService } from 'src/app/service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { ValidacaoFormularioService } from 'src/app/utilities/validacao-formulario/validacao-formulario.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { OrcamentosOpcaoResponse } from 'src/app/dto/orcamentos/OrcamentosOpcaoResponse';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
//import { dateToLocalArray } from '@fullcalendar/core/datelib/marker';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentoCotacaoResponse } from 'src/app/dto/orcamentos/OrcamentoCotacaoResponse';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { Estado } from 'src/app/dto/ceps/estado';

@Component({
  selector: 'app-cadastrar-cliente',
  templateUrl: './cadastrar-cliente.component.html',
  styleUrls: ['./cadastrar-cliente.component.scss']
})

export class CadastrarClienteComponent implements OnInit, AfterViewInit {

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
    private readonly orcamentoService: OrcamentosService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sweetalertService: SweetalertService) { }

  //uteis
  public mascaraTelefone: string;
  public form: FormGroup;
  public mensagemErro: string = "*Campo obrigatório.";
  public constantes: Constantes = new Constantes();
  usuario = new Usuario();

  //listas
  public lstVendedores: SelectItem[] = [];
  public lstVendedoresParceiros: SelectItem[] = [];
  public lstParceiro: SelectItem[] = [];
  public lstEstado: SelectItem[] = [];
  lojasUsuario: SelectItem[] = [];
  lstTipo: SelectItem[];
  lstContribuinteICMS: SelectItem[];
  lstInstaladorInstala: SelectItem[];
  mostrarInstaladorInstala: boolean;
  limiteDataEntrega: number;
  maxDataEntrega: Date = new Date();
  minDataEntrega: Date = new Date();

  //controle de campos
  public desabilitado: boolean = true;

  tipoUsuario: number;//usar o do Usuario
  habilitarClone: boolean = false;
  habilitarVoltar: boolean = false;
  @ViewChild("nome") nome: ElementRef;
  carregando: boolean;
  dataEntrega = true;
  filtro: string;

  ngOnInit(): void {
    this.carregando = true;
    this.activatedRoute.params.subscribe((param: any) => { this.verificarParam(param); });
    this.mascaraTelefone = FormataTelefone.mascaraTelefone();
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.criarForm();
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.buscarTiposCliente();
    this.buscarContribuinteICMS();
    this.buscarInstaladorInstala();
    this.setarCamposDoForm();
    this.desabilitarCampos();
    this.desabiltarCamposParaEdicao();

    const promises = [this.buscarConfigValidade(), this.buscarLimiteDiasEntregaImediata(), this.buscarVendedores(),
    this.buscarParceirosPorVendedor(), this.buscarVendedoresDoParceiro(), this.buscarEstados()];

    Promise.all(promises).then((r: Array<any>) => {
      this.setarOrcamentoValidade(r[0]);
      this.setarLimiteDiasEntregaImediata(r[1]);
      this.setarVendedores(r[2]);
      this.setarParceiros(r[3]);
      this.setarVendedoresDoParceiro(r[4]);
      this.setarEstados(r[5]);

    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    }).finally(() => {
      this.carregando = false;
    });
  }

  ngAfterViewInit(): void {
    this.nome.nativeElement.focus();
  }

  verificarParam(param: any) {
    if (param.filtro == undefined) {

      if (this.novoOrcamentoService.orcamentoCotacaoDto == undefined ||
        this.novoOrcamentoService.orcamentoCotacaoDto.cadastradoPor == undefined) {
        this.router.navigate(["/orcamentos/listar/orcamentos"]);
        return;
      }

      if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro == null) {
        this.novoOrcamentoService.orcamentoCotacaoDto.parceiro = this.constantes.SEM_INDICADOR;
      }
      this.habilitarVoltar = true;

      if (this.novoOrcamentoService.orcamentoCotacaoDto.parceiro != null) {
        this.mostrarInstaladorInstala = true;
      }
    }

    if (param.filtro == "novo") {
      this.filtro = param.filtro;
    }

    if (param.filtro == "iniciar") {
      this.novoOrcamentoService.criarNovo();
      this.novoOrcamentoService.opcaoOrcamentoCotacaoDto = new OrcamentosOpcaoResponse();
      this.filtro = param.filtro;
      this.criarForm();
      this.desabilitarCampos();
      this.desabiltarCamposParaEdicao();
    }

    if (param.filtro == "clone") {
      if (this.novoOrcamentoService.orcamentoCotacaoDto.id == undefined) {
        this.router.navigate(["/orcamentos/listar/orcamentos"]);
        return;
      }

      if (this.novoOrcamentoService.orcamentoCotacaoDto.status != undefined) {
        this.novoOrcamentoService.orcamentoCloneCotacaoDto = new OrcamentoCotacaoResponse();
        this.novoOrcamentoService.orcamentoCloneCotacaoDto = JSON.parse(JSON.stringify(this.novoOrcamentoService.orcamentoCotacaoDto));

      }

      this.filtro = param.filtro;
      if (this.novoOrcamentoService.orcamentoCloneCotacaoDto.status != undefined) this.novoOrcamentoService.criarNovo();
      this.novoOrcamentoService.orcamentoCotacaoDto.id = this.novoOrcamentoService.orcamentoCloneCotacaoDto.id;
      this.novoOrcamentoService.orcamentoCloneCotacaoDto.status = undefined;
      this.habilitarClone = true;
      this.habilitarVoltar = true;
      if (this.novoOrcamentoService.orcamentoCloneCotacaoDto.status != undefined) this.criarForm();
    }
  }

  criarForm(): void {
    if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto == undefined)
      this.novoOrcamentoService.criarNovo();

    let clienteOrcamentoCotacao = this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto;
    this.form = this.fb.group({
      Validade: [null, [Validators.required]],//A validade está estipulada em um valor fixo de 7 dias corridos
      ObservacoesGerais: [this.novoOrcamentoService.orcamentoCotacaoDto.observacoesGerais],
      Nome: [clienteOrcamentoCotacao.nomeCliente, [Validators.required, Validators.maxLength(60)]],
      NomeObra: [clienteOrcamentoCotacao.nomeObra, [Validators.maxLength(120)]],
      Vendedor: [this.novoOrcamentoService.orcamentoCotacaoDto.vendedor, [Validators.required]],
      Email: [clienteOrcamentoCotacao.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"), Validators.maxLength(60)]],
      Parceiro: [this.novoOrcamentoService.orcamentoCotacaoDto.parceiro],
      Telefone: [clienteOrcamentoCotacao.telefone, [Validators.required, Validators.maxLength(11), Validators.minLength(7)]],
      VendedorParceiro: [this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro],
      Concorda: [this.novoOrcamentoService.orcamentoCotacaoDto.concordaWhatsapp],
      Uf: [clienteOrcamentoCotacao.uf, [Validators.required, Validators.maxLength(2)]],
      Tipo: [clienteOrcamentoCotacao.tipo, [Validators.required, Validators.maxLength(2)]],
      EntregaImediata: [this.novoOrcamentoService.orcamentoCotacaoDto.entregaImediata],
      DataEntregaImediata: [this.novoOrcamentoService.orcamentoCotacaoDto.dataEntregaImediata != null ? new Date(this.novoOrcamentoService.orcamentoCotacaoDto.dataEntregaImediata) : null],
      ContribuinteICMS: [clienteOrcamentoCotacao.contribuinteICMS],
      instaladorInstala: [this.novoOrcamentoService.orcamentoCotacaoDto.instaladorInstala ?? this.constantes.COD_INSTALADOR_INSTALA_NAO_DEFINIDO, !this.verificarInstaladorInstala() ? [] : [Validators.required, Validators.min(this.constantes.COD_INSTALADOR_INSTALA_NAO)]]
    });
  }

  buscarTiposCliente(): void {
    this.lstTipo = [
      { label: this.constantes.ID_PF, value: this.constantes.ID_PF },
      { label: this.constantes.ID_PJ, value: this.constantes.ID_PJ }
    ]
  }

  buscarContribuinteICMS(): void {
    this.lstContribuinteICMS = [
      { label: "Sim", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_SIM },
      { label: "Não", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_NAO },
      { label: "Isento", value: this.constantes.COD_ST_CLIENTE_CONTRIBUINTE_ICMS_ISENTO }
    ]
  }

  buscarInstaladorInstala(): void {
    this.lstInstaladorInstala = [
      { label: "Sim", value: this.constantes.COD_INSTALADOR_INSTALA_SIM },
      { label: "Não", value: this.constantes.COD_INSTALADOR_INSTALA_NAO }
    ]
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

  desabilitarCampos() {

    if (this.filtro == undefined || this.filtro == "novo" || this.filtro == "clone") {
      if (this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.length > 0) {
        this.form.controls.Parceiro.disable();
        this.form.controls.Tipo.disable();
        this.form.controls.VendedorParceiro.disable();
      }
    }

    this.form.controls.Validade.disable();
  }

  desabiltarCamposParaEdicao() {
    if (this.filtro == undefined) {
      this.novoOrcamentoService.orcamentoCotacaoDto.listaOrcamentoCotacaoDto.forEach(opcao => {
        opcao.listaProdutos.forEach(produto => {
          if (produto.idOperacaoAlcadaDescontoSuperior != null) {
            this.form.controls.Uf.disable();
            this.form.controls.VendedorParceiro.disable();
            if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo == this.constantes.ID_PJ) {
              this.form.controls.ContribuinteICMS.disable();
            }
          }
        });
      });

      this.form.controls.Vendedor.disable();
      this.form.controls.Parceiro.disable();
      this.form.controls.VendedorParceiro.disable();
    }
  }

  buscarConfigValidade(): Promise<ValidadeOrcamento> {
    return this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise();
  }

  buscarLimiteDiasEntregaImediata(): Promise<any> {
    return this.orcamentoService.buscarParametros(this.constantes.ModuloOrcamentoCotacao_EntregaImediata_PrazoMaxPrevisaoEntrega, this.usuario.loja, null).toPromise();
  }

  buscarVendedores(): Promise<Usuario[]> {
    if (this.tipoUsuario == this.constantes.GESTOR) {
      return this.usuarioService.buscarVendedores(this.usuario.loja).toPromise();
    }
  }

  buscarParceirosPorVendedor(): Promise<OrcamentistaIndicadorDto[]> {
    if (this.tipoUsuario == this.constantes.VENDEDOR_UNIS ||
      this.usuario.permissoes.includes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
      let loja: string = this.usuario.loja;
      return this.orcamentistaIndicadorService.buscarParceirosPorLoja(loja).toPromise();
    }
  }

  buscarVendedoresDoParceiro(): Promise<OrcamentistaIndicadorVendedorDto[]> {
    let parceiro: string;

    parceiro = this.form.controls.Parceiro.value;

    this.form.controls.VendedorParceiro.setValue(null);
    this.lstVendedoresParceiros = [];

    if (parceiro == null || parceiro == "" || parceiro == undefined) {
      this.form.controls.Parceiro.setValue(null);
      return;
    }

    if (parceiro == this.constantes.SEM_INDICADOR) {
      this.mostrarInstaladorInstala = false;
      this.form.controls.instaladorInstala.clearValidators();
      this.form.controls.instaladorInstala.updateValueAndValidity();
      return;
    }

    if(this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) return;

    return this.orcamentistaIndicadorVendedorService.buscarVendedoresParceiros(parceiro).toPromise();
  }

  buscarEstados(): Promise<Estado[]> {
    return this.cepService.buscarEstados().toPromise();
  }

  setarOrcamentoValidade(r: any) {
    if (r != null) {
      this.novoOrcamentoService.configValidade = r;
      if (!this.novoOrcamentoService.orcamentoCotacaoDto.validade) {
        let data = new Date(Date.now() + this.novoOrcamentoService.configValidade.QtdeDiasValidade * 24 * 60 * 60 * 1000);
        this.form.controls.Validade.setValue(data);
        return;
      }

      let validade = new Date(this.novoOrcamentoService.orcamentoCotacaoDto.validade);
      this.form.controls.Validade.setValue(validade);
    }

  }

  setarLimiteDiasEntregaImediata(r: any) {
    if (!r) {
      this.alertaService.mostrarMensagem("Ops! Não encontramos o limite de dias para data de entrega!");
      return;
    }

    this.limiteDataEntrega = parseInt(r[0]['Valor']);

    let dataAtual = new Date();
    this.minDataEntrega = dataAtual;
    this.maxDataEntrega.setDate(dataAtual.getDate() + this.limiteDataEntrega);
  }
  
  setarVendedores(r: Array<Usuario>) {
    if (r != null) {
      this.lstVendedores = this.montarListaParaSelectItem(r);
      this.form.controls.Vendedor.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.vendedor);
    }
  }

  setarParceiros(r: Array<OrcamentistaIndicadorDto>) {
    if (r != null) {
      this.lstParceiro = this.montarListaParaSelectItem(r);
      this.form.controls.Parceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.parceiro);
    }
  }

  setarVendedoresDoParceiro(r: Array<OrcamentistaIndicadorVendedorDto>) {
    if (r != null) {
      this.lstVendedoresParceiros = this.montarListaParaSelectItem(r);
      this.form.controls.VendedorParceiro.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro);
    }
    this.mostrarInstaladorInstala = true;
    this.form.controls.instaladorInstala.setValidators([Validators.required, Validators.max(this.constantes.COD_INSTALADOR_INSTALA_SIM), Validators.min(this.constantes.COD_INSTALADOR_INSTALA_NAO)]);
    this.form.controls.instaladorInstala.updateValueAndValidity();
  }

  setarEstados(r: Array<Estado>) {
    if (r != null) {
      r.forEach(x => {
        let item: SelectItem = { label: x.uf, value: x.uf };
        this.lstEstado.push(item);
      });
      this.form.controls.Uf.setValue(this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.uf);
    }
  }

  formataData(e: Event) {
    let valor = ((e.target) as HTMLInputElement).value;
    if (valor != "") {
      return valor
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1");
    }
  }

  montarListaParaSelectItem(lista: Array<any>): SelectItem[] {
    let listaResponse: SelectItem[] = [];
    lista.forEach(x => {
      if (x != null) {
        let item: SelectItem = { label: x.nome, value: x.nome };
        listaResponse.push(item);
      }
    });

    return listaResponse;
  }

  parceiroOnChange(): void {
    this.carregando = true;
    
    Promise.all([this.buscarVendedoresDoParceiro()]).then((r) => {
      this.setarVendedoresDoParceiro(r[0]);
      this.carregando = false;
    }).catch((r) => {
      this.alertaService.mostrarErroInternet(r)
      this.carregando = false;
    });
  }

  entregaImediataOnChange() {
    let entrega = this.form.controls.EntregaImediata.value;
    if (entrega) this.form.controls.DataEntregaImediata.setValue(null);
  }

  verificarInstaladorInstala() {
    if (this.tipoUsuario == this.constantes.PARCEIRO || this.tipoUsuario == this.constantes.PARCEIRO_VENDEDOR) {
      this.mostrarInstaladorInstala = true;
      return true;
    }

    return false;
  }

  atribuirDados() {
    let clienteOrcamentoCotacao = new ClienteOrcamentoCotacaoDto();
    clienteOrcamentoCotacao.nomeCliente = this.form.controls.Nome.value;
    clienteOrcamentoCotacao.nomeObra = this.form.controls.NomeObra.value;
    clienteOrcamentoCotacao.email = this.form.controls.Email.value;
    clienteOrcamentoCotacao.telefone = this.form.controls.Telefone.value;
    clienteOrcamentoCotacao.uf = this.form.controls.Uf.value;
    clienteOrcamentoCotacao.tipo = this.form.controls.Tipo.value;
    clienteOrcamentoCotacao.contribuinteICMS = this.form.controls.ContribuinteICMS.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto = clienteOrcamentoCotacao;

    this.novoOrcamentoService.orcamentoCotacaoDto.id = this.novoOrcamentoService.orcamentoCotacaoDto.id;

    this.novoOrcamentoService.orcamentoCotacaoDto.validade = DataUtils.formata_dataString_para_formato_data(DataUtils.formatarTela(this.form.controls.Validade.value));
    this.novoOrcamentoService.orcamentoCotacaoDto.observacoesGerais = this.form.controls.ObservacoesGerais.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.vendedor = this.form.controls.Vendedor.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.parceiro = this.form.controls.Parceiro.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.concordaWhatsapp = this.form.controls.Concorda.value == null ? 0 : this.form.controls.Concorda.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.vendedorParceiro = !this.form.controls.VendedorParceiro.value ? this.form.controls.VendedorParceiro.value : this.form.controls.VendedorParceiro.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.loja = this.autenticacaoService._lojaLogado;
    this.novoOrcamentoService.orcamentoCotacaoDto.entregaImediata = this.form.controls.EntregaImediata.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.dataEntregaImediata = this.form.controls.DataEntregaImediata.value;
    this.novoOrcamentoService.orcamentoCotacaoDto.instaladorInstala = this.form.controls.instaladorInstala.value == 0 ? this.constantes.COD_INSTALADOR_INSTALA_NAO : this.form.controls.instaladorInstala.value;
  }

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

  validarContribuinteICMS() {
    if (this.form.controls.Tipo.value == this.constantes.ID_PF) {
      this.form.controls.ContribuinteICMS.setValue(null);
      this.form.controls.ContribuinteICMS.setErrors(null);
      return true;
    }

    if (this.form.controls.Tipo.value == this.constantes.ID_PJ) {
      if (this.form.controls.ContribuinteICMS.value == 0 ||
        this.form.controls.ContribuinteICMS.value == undefined) {
        this.form.controls.ContribuinteICMS.setErrors({ "status": "INVALID" });
        this.form.controls.ContribuinteICMS.markAsDirty();
        return false;
      }
    }

    this.form.controls.ContribuinteICMS.setErrors(null);
    return true;
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

    if (this.form.controls.Parceiro.value == this.constantes.SEM_INDICADOR) {
      this.form.controls.VendedorParceiro.setValue(null);
    }

    if (!this.validarContribuinteICMS()) return;

    this.atribuirDados();

    this.router.navigate(["orcamentos/itens", this.filtro]);
  }

  atualizarDadosCadastrais() {
    this.carregando = true;
    if (!this.validacaoFormularioService.validaForm(this.form)) {
      this.carregando = false;
      return;
    }

    this.atribuirDados();

    this.orcamentoService.atualizarDadosOrcamento(this.novoOrcamentoService.orcamentoCotacaoDto).toPromise().then((r) => {
      if (r.erro != null) {
        this.alertaService.mostrarMensagem(r.erro);
        this.carregando = false;
        return;
      }

      this.carregando = false;
      this.sweetalertService.sucesso("Cadastro atualizado com sucesso!");
      this.router.navigate(["orcamentos/aprovar-orcamento", this.novoOrcamentoService.orcamentoCotacaoDto.id]);

    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    });
  }

  voltar() {
    this.router.navigate(["orcamentos/aprovar-orcamento", this.novoOrcamentoService.orcamentoCotacaoDto.id]);
  }
}
