import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { BuscarParceiroRequest } from 'src/app/dto/orcamentista-indicador/buscar-parceiro-request';
import { ConsultaGerencialOrcamentoRequest } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-request';
import { ConsultaGerencialOrcamentoResponse } from 'src/app/dto/orcamentos/consulta-gerencial-orcamento-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';

@Component({
  selector: 'app-orcamentos',
  templateUrl: './orcamentos.component.html',
  styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentoService: OrcamentosService,
    private readonly sweetAlertService: SweetalertService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly orcamentistaService: OrcamentistaIndicadorService,
    public readonly cdr: ChangeDetectorRef) { }

  @Input() listaNome = "";

  form: FormGroup;
  nomeLista: string;
  consultaOrcamentoGerencialResponse = new Array<ConsultaGerencialOrcamentoResponse>();
  consultaOrcamentoGerencialResquest: ConsultaGerencialOrcamentoRequest = new ConsultaGerencialOrcamentoRequest();
  first: number = 0;
  qtdeRegistros: number;
  carregando: boolean = true;
  qtdePorPaginaInicial: number = 10;
  dataUtils: DataUtils = new DataUtils();
  mostrarQtdePorPagina: boolean = false;
  permissaoUniversal: boolean = false;
  desabilitaCboParceiros:boolean = true;
  parceiro:number;
  //Combos
  cboVendedores: Array<DropDownItem> = [];
  cboFiltradoVendedores: Array<DropDownItem> = [];
  cboLojas: Array<DropDownItem> = [];
  cboComParceiros: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboFabricantes: Array<DropDownItem> = [];
  cboGrupos: Array<DropDownItem> = [];
  //filtros
  lojas: Array<string> = new Array<string>();
  vendedor: DropDownItem;
  comParceiro:number;

  ngOnInit(): void {

    if (this.listaNome == "vigentes") this.nomeLista = "Vigentes";
    if (this.listaNome == "cadastrados") this.nomeLista = "Cadastrados";
    if (this.listaNome == "pendentes") this.nomeLista = "com Mensagens Pendentes";
    if (this.listaNome == "expirados") this.nomeLista = "Expirados";

    if (this.autenticacaoService.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar))
      this.permissaoUniversal = true;

    this.criarForm();
    this.buscarCboVendedores();
    this.buscarCboLojas();
    this.buscarCboComParceiro();
  }

  criarForm() {
    this.form = this.fb.group({
      vendedor: [],
      loja: [],
      comParceiro: [],
      parceiro: [],
      vendedorParceiro: [],
      fabricante: [],
      grupo: [],
      dtCriacaoInicio: [],
      dtCriacaoFim: []
    });
  }

  buscarCboVendedores() {
    if (this.permissaoUniversal) {
      let request = new UsuariosPorListaLojasRequest();
      request.lojas = this.autenticacaoService._lojasUsuarioLogado;

      this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise().then((r) => {
        if (!r.Sucesso) {
          this.sweetAlertService.aviso(r.Mensagem);
          return;
        }

        r.usuarios.forEach(x => {
          this.cboVendedores.push({ Id: x.vendedor, Value: x.nomeIniciaisMaiusculo });
        });
        this.vendedor = {Id:"", Value: "" };
        this.cboFiltradoVendedores = this.cboVendedores;
      }).catch((e) => {
        this.sweetAlertService.aviso(e.error.Mensagem);
      });
    }
  }

  filtrarVendedores(event) {
    let filtrado: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.cboVendedores.length; i++) {
      let vende = this.cboVendedores[i];
      if (vende.Value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(vende);
      }
    }

    this.cboFiltradoVendedores = filtrado;
  }

  buscarLista(filtro: ConsultaGerencialOrcamentoRequest) {
    this.carregando = true;
    this.orcamentoService.consultaGerencial(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        this.carregando = false;
        return;
      }
      this.consultaOrcamentoGerencialResponse = r.lstConsultaGerencialOrcamentoResponse;
      this.qtdeRegistros = r.qtdeRegistros;
      this.carregando = false;
      this.mostrarQtdePorPagina = true;
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
      this.carregando = false;
    });

  }

  buscarRegistros(event: LazyLoadEvent) {
    if (this.consultaOrcamentoGerencialResponse.length > 0) {
      this.consultaOrcamentoGerencialResquest.pagina = event.first / event.rows;
      this.consultaOrcamentoGerencialResquest.qtdeItensPagina = event.rows;
      this.buscarLista(this.consultaOrcamentoGerencialResquest);
    }
  }

  ascendente: boolean = false;
  colunaOrdenacao: string;
  ordenar(coluna: string) {
    if (coluna == this.colunaOrdenacao) this.ascendente = !this.ascendente;
    else this.ascendente = false;

    this.colunaOrdenacao = coluna;

    this.consultaOrcamentoGerencialResquest.ordenacaoAscendente = this.ascendente;
    this.consultaOrcamentoGerencialResquest.nomeColunaOrdenacao = this.colunaOrdenacao;
    this.consultaOrcamentoGerencialResquest.qtdeItensPagina = this.qtdePorPaginaInicial;
    this.consultaOrcamentoGerencialResquest.lojas = this.autenticacaoService.usuario.lojas;
    this.buscarLista(this.consultaOrcamentoGerencialResquest);
    this.cdr.detectChanges();
  }

  buscarCboLojas() {
    let lojasUsuario = this.autenticacaoService._lojasUsuarioLogado;
    lojasUsuario.forEach(x => {
      this.cboLojas.push({ Id: x, Value: x });
    });
  }

  pesquisar() {
    debugger;
    if (this.lojas) {

    }
  }

  buscarCboParceiros() {
    if(this.lojas.length <= 0) return;
    if (!this.vendedor.Id) return;
    if(!this.comParceiro){
      this.desabilitaCboParceiros = true;
      return;
    }
    if(this.comParceiro == 2){
      this.desabilitaCboParceiros = true;
      return;
    } 

    this.desabilitaCboParceiros = false;

    let filtro: BuscarParceiroRequest = new BuscarParceiroRequest();
    filtro.vendedor = this.vendedor.Id.toString();
    filtro.lojas = this.lojas;

    this.orcamentistaService.buscarParceirosPorIdVendedor(filtro).toPromise().then((r) => {
      if (!r.Sucesso) {
        this.sweetAlertService.aviso(r.Mensagem);
        return;
      }

      r.parceiros.forEach(x => {
        this.cboParceiros.push({ Id: x.id, Value: x.razaoSocial });
      });
    }).catch((e) => {
      this.sweetAlertService.aviso(e.error.Mensagem);
    });
  }

  buscarCboComParceiro() {
    this.cboComParceiros.push({ Id: 1, Value: "Sim" });
    this.cboComParceiros.push({ Id: 2, Value: "Não" });
  }
}
