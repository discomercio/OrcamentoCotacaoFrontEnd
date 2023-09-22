import { Component, OnInit } from '@angular/core';
import { Filtro } from 'src/app/dto/orcamentos/filtro';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Constantes } from 'src/app/utilities/constantes';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';
import { OrcamentosService } from 'src/app/service/orcamento/orcamentos.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { UsuariosPorListaLojasResponse } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { ValidadeOrcamento } from 'src/app/dto/config-orcamento/validade-orcamento';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';

@Component({
  selector: 'app-itens-orcamentos',
  templateUrl: './itens-orcamentos.component.html',
  styleUrls: ['./itens-orcamentos.component.scss']
})
export class ItensOrcamentosComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService,
    private readonly alertaService: AlertaService,
    private readonly orcamentoService: OrcamentosService,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService) { }

  carregando: boolean;
  constantes: Constantes = new Constantes();

  filtro: Filtro = new Filtro();
  admModulo: boolean;
  usuario = new Usuario();
  tipoUsuario: number;

  cboLojas: Array<DropDownItem> = [];
  cboStatus: Array<DropDownItem> = [];
  cboVendedores: Array<DropDownItem> = [];
  cboFiltradoVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  cboVendedoresParceiros: Array<DropDownItem> = [];
  cboComIndicador: Array<DropDownItem> = [];
  cboDatas: Array<DropDownItem> = [];
  cboOpcoes: Array<DropDownItem> = [];
  dtInicio: Date;
  dtFim: Date;
  configValidade: ValidadeOrcamento;
  fraseRegistros: string = `Foram encontrados [qtdeRegistros] registros`;
  fraseInicial: string = "Clique em Pesquisar para consultar os registros";
  clicouPesquisar: boolean = false;
  qtdeRegistros: number = 0;
  filtroParceirosApoio: string[];

  ngOnInit(): void {
    this.carregando = true;

    if (this.autenticacaoService._tipoUsuario != this.constantes.VENDEDOR_UNIS) {
      this.carregando = false;
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);

    const promises = [this.buscarStatus(), this.buscarVendedores(), this.buscarParceiros(), this.buscarConfigValidade()];
    Promise.all(promises).then((r: Array<any>) => {
      this.setarLojas();
      this.setarStatus(r[0]);
      this.setarVendedores(r[1]);
      this.setarOpcoes();
      this.setarParceiros(r[2]);
      this.setarOpcoesOrcamento();
      this.setarConfigValidade(r[3]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    }).finally(() => {

      this.carregando = false;
    });

  }

  buscarStatus(): Promise<any> {
    return this.orcamentoService.buscarStatus('ORCAMENTOS').toPromise();
  }

  buscarVendedores(): Promise<UsuariosPorListaLojasResponse> {
    if (this.admModulo) {
      let request = new UsuariosPorListaLojasRequest();
      request.lojas = [];
      request.lojas.push(this.autenticacaoService._lojaLogado);

      return this.usuarioService.buscarVendedoresPorListaLojas(request).toPromise();
    }
  }

  buscarParceiros(): Promise<OrcamentistaIndicadorDto[]> {
    return this.orcamentistaIndicadorService.buscarParceirosPorLoja(this.autenticacaoService._lojaLogado).toPromise()
  }

  buscarConfigValidade(): Promise<ValidadeOrcamento> {
    return this.orcamentoService.buscarConfigValidade(this.autenticacaoService._lojaLogado).toPromise();
  }

  setarStatus(status: Array<any>) {
    if (status != null) {
      status = status.filter(x => x.Id != this.constantes.STATUS_ORCAMENTO_COTACAO_EXCLUIDO);
      status.forEach(e => {
        this.cboStatus.push({ Id: e.Id, Value: e.Value });
      });
    }
  }

  setarLojas() {
    let lojasUsuario = this.autenticacaoService.usuario.lojas;
    lojasUsuario.forEach(x => {
      this.cboLojas.push({ Id: x, Value: x });
    })
  }

  setarVendedores(vendedores: UsuariosPorListaLojasResponse) {
    if (this.tipoUsuario.toString() == this.constantes.PARCEIRO.toString() ||
      this.tipoUsuario.toString() == this.constantes.PARCEIRO_VENDEDOR.toString()) return;

    if (vendedores && !vendedores.Sucesso) {
      this.sweetAlertService.aviso(vendedores.Mensagem);
      return;
    }
    if (this.admModulo) {
      this.cboVendedores = new Array<any>();
      vendedores.usuarios.forEach(x => {
        this.cboVendedores.push({ Id: x.id, Value: x.vendedor });
      });
      this.cboFiltradoVendedores = this.cboVendedores;
    }

    this.cboVendedores = this.cboVendedores.sort((a, b) => (a.Value < b.Value ? -1 : 1));
  }

  setarOpcoes() {
    this.cboOpcoes.push({ Id: 0, Value: this.constantes.TODAS_OPCOES });
    this.cboOpcoes.push({ Id: 1, Value: this.constantes.OPCOES_APROVADAS });
  }

  setarParceiros(parceiros: Array<OrcamentistaIndicadorDto>) {
    if (parceiros != null) {
      parceiros.forEach(x => {
        if (!!x.nome) {
          if (!this.cboParceiros.find(f => f.Value == x.nome))
            this.cboParceiros.push({ Id: "", Value: x.nome });
        }
      });

      this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
    }
  }

  setarOpcoesOrcamento() {
    this.cboComIndicador.push({ Id: 0, Value: "Não" });
    this.cboComIndicador.push({ Id: 1, Value: "Sim" });
  }

  setarConfigValidade(config: ValidadeOrcamento) {
    this.configValidade = config;

    let dtIni = new Date(Date.now() - this.configValidade.MaxPeriodoConsultaFiltroPesquisa * 24 * 60 * 60 * 1000);
    this.dtInicio = dtIni;
    this.dtFim = new Date();
  }

  pesquisar() {
    this.sweetAlertService.aviso("Estamos implementando!");

    this.clicouPesquisar = true;
    this.qtdeRegistros = 25;
    // this.setarFiltro();
  }

  setarFiltro() {

    if (this.dtInicio) {
      this.filtro.DtInicio = DataUtils.formataParaFormulario(new Date(this.dtInicio));
    } else this.filtro.DtInicio = null;

    if (this.dtFim) {
      this.filtro.DtFim = DataUtils.formataParaFormulario(new Date(this.dtFim));
    }
    else this.filtro.DtFim = null;

    this.filtroParceirosApoio = this.filtro.Parceiros;
    let filtroParceiro = this.filtro.Parceiros;
    this.filtro.Parceiros = new Array();
    if (filtroParceiro) {
      filtroParceiro.forEach(x => {
        this.filtro.Parceiros.push(x);
      });
    }
    this.filtro.Exportar = false;
  }

  buscarLista(filtro: Filtro) {
    this.carregando = true;

    this.carregando = false;
  }

  exportXlsx() {
    this.sweetAlertService.aviso("Estamos implementando!");
    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }

  exportCsv() {
    this.sweetAlertService.aviso("Estamos implementando!");
    this.qtdeRegistros = 0;
    this.clicouPesquisar = false;
  }
}
