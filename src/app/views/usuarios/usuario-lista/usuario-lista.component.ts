import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { OrcamentistaIndicadorVendedorService } from '../../../service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { UsuarioTipo } from 'src/app/dto/usuarios/UsuarioTipo';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { OrcamentistaIndicadorVendedorDeleteRequest } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor-delete-request';
import { LazyLoadEvent } from 'primeng/api';
import { UsuariosRequest } from 'src/app/dto/usuarios/usuarios-request';
import { OrcamentistaVendedorResponse } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-vendedor-response';
import { DropDownItem } from '../../orcamentos/models/DropDownItem';
import { UsuariosPorListaLojasResponse } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-response';
import { UsuariosPorListaLojasRequest } from 'src/app/dto/usuarios/usuarios-por-lista-lojas-request';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { OrcamentistaIndicadorDto } from 'src/app/dto/orcamentista-indicador/orcamentista-indicador';
import { OrcamentistaIndicadorService } from 'src/app/service/orcamentista-indicador/orcamentista-indicador.service';
import { Constantes } from 'src/app/utilities/constantes';
import { DataUtils } from 'src/app/utilities/formatarString/data-utils';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styleUrls: ['./usuario-lista.component.scss']
})
export class UsuarioListaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly alertaService: AlertaService,
    private readonly autenticacaoService: AutenticacaoService,
    private readonly router: Router,
    private readonly sweetAlertService: SweetalertService,
    private readonly usuarioService: UsuariosService,
    private readonly orcamentistaIndicadorService: OrcamentistaIndicadorService,
    private readonly cdr: ChangeDetectorRef) { }

  @ViewChild('dataTable') table: Table;
  cols: any[];
  carregando: boolean;
  tipo: UsuarioTipo = 'todos';
  permite: boolean = false;
  first: number = 0;
  realizandoAcao: boolean = false;
  qtdePorPaginaInicial: number = 10;
  qtdeRegistros: number = 0;
  filtro: UsuariosRequest = new UsuariosRequest();
  usuarioLista: Array<OrcamentistaVendedorResponse> = new Array();
  cboAtivos: Array<DropDownItem> = [];
  admModulo: boolean;
  usuario = new Usuario();
  tipoUsuario: number;
  cboVendedores: Array<DropDownItem> = [];
  cboParceiros: Array<DropDownItem> = [];
  constantes: Constantes = new Constantes();
  idValuesTmp = 0;
  cboBloqueados: Array<DropDownItem> = [];
  colunaSort: number;

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.UsuarioVendedorParceiro)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['dashboards']);
      return;
    }

    this.carregando = true;
    this.tipoUsuario = this.autenticacaoService._tipoUsuario;
    this.usuario = this.autenticacaoService.getUsuarioDadosToken();
    this.permite = this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar);
    this.admModulo = this.usuario.permissoes.includes(ePermissao.AcessoUniversalOrcamentoPedidoPrepedidoConsultar);
    this.criarColunas();
    this.criarFiltroAtivo();
    this.criarFiltroBloqueado();

    const promises: any = [this.buscarVendedores(), this.buscarParceiros()];
    Promise.all(promises).then((r: Array<any>) => {
      this.setarVendedores(r[0]);
      this.setarParceiros(r[1]);
    }).catch((e) => {
      this.alertaService.mostrarErroInternet(e);
      this.carregando = false;
    }).finally(() => {
      this.carregando = false;
      // this.pesquisaAuto();
      this.setarFiltro();
    });

  }
  dataUtils: DataUtils = new DataUtils();
  criarFiltroAtivo() {
    this.cboAtivos.push({ Id: 1, Value: "Sim" });
    this.cboAtivos.push({ Id: 0, Value: "Não" });
  }

  criarFiltroBloqueado() {
    this.cboBloqueados.push({ Id: 1, Value: "Sim" });
    this.cboBloqueados.push({ Id: 0, Value: "Não" });
  }

  criarColunas() {
    this.cols = [
      { field: 'parceiro', header: 'Parceiro' },
      { field: 'nome', header: 'Nome' },
      { field: 'email', header: 'E-mail', width: '300px' },
      { field: 'vendedorResponsavel', header: 'Responsável' },
      { field: 'ativoLabel', header: 'Ativo', width: '60px' }
    ];
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
    }

    this.cboVendedores = this.cboVendedores.sort((a, b) => (a.Value < b.Value ? -1 : 1));
  }

  setarParceiros(parceiros: Array<OrcamentistaIndicadorDto>) {
    if (parceiros != null) {
      parceiros.forEach(x => {
        if (!!x.nome) {
          if (!this.cboParceiros.find(f => f.Value == x.nome) && x.nome != this.constantes.SEM_INDICADOR)
            this.cboParceiros.push({ Id: (this.idValuesTmp++).toString(), Value: x.nome });
        }
      });

      this.cboParceiros = this.cboParceiros.sort((a, b) => a.Value.localeCompare(b.Value, 'pt'));
    }
  }

  setarFiltro() {
    let url = sessionStorage.getItem("urlAnterior");
    if (!!url && url.indexOf("/usuarios/usuario-edicao") > -1) {
      let json = sessionStorage.getItem("filtro");
      this.filtro = JSON.parse(json);
    } else {
      if (this.autenticacaoService._tipoUsuario != 1) {
        this.filtro.parceiro = this.autenticacaoService._parceiro;
        this.filtro.loja = this.autenticacaoService._lojaLogado;
      }
      else {
        if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
          this.filtro.loja = this.autenticacaoService._lojaLogado;
        } else {
          this.filtro.vendedor = this.autenticacaoService._usuarioLogado;
          this.filtro.loja = this.autenticacaoService._lojaLogado;
        }
      }

      this.filtro.tipoUsuario = Number.parseInt(this.autenticacaoService._tipoUsuario.toString());
      this.filtro.pagina = 0;
      this.filtro.pesquisa = "";
      this.filtro.qtdeItensPagina = this.qtdePorPaginaInicial;
      this.filtro.ordenacaoAscendente = false;
      this.colunaSort = this.filtro.ordenacaoAscendente ? -1 : 1;
      this.filtro.nomeColuna = "Nome";
      this.cdr.detectChanges();
    }

    this.buscarLista(this.filtro);
  }

  filtrar() {
    this.filtro.nomeColuna = "Nome";
    this.filtro.ordenacaoAscendente = false;
    this.colunaSort = this.filtro.ordenacaoAscendente ? -1 : 1;
    this.cdr.detectChanges();
    this.filtro.pagina = 0;
    this.first = 0;
    this.buscarLista(this.filtro);
  }

  buscarLista(filtro: UsuariosRequest) {

    this.carregando = true;
    sessionStorage.setItem("filtro", JSON.stringify(filtro));
    this.orcamentistaIndicadorVendedorService.buscarVendedoresParceiro(filtro).toPromise().then((r) => {
      this.carregando = false;
      if (!r.Sucesso) {
        this.alertaService.mostrarMensagem(r.Mensagem);
        return;
      }

      if (this.filtro.pagina == 0 && r.listaOrcamentistaVendedor.length == 0) {
        this.first = 0;
      }
      if (this.filtro.pagina > 0 && r.listaOrcamentistaVendedor.length == 0) {
        this.filtro.pagina--;
        this.buscarLista(this.filtro);
        return;
      }
      this.usuarioLista = r.listaOrcamentistaVendedor;
      this.qtdeRegistros = r.qtdeRegistros;

      if (!!this.filtro.pagina)
        this.first = this.filtro.pagina * this.filtro.qtdeItensPagina;

    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    });
  }

  buscarRegistros(event: LazyLoadEvent) {
    if (this.usuarioLista.length == 0) return;
    this.filtro.pagina = event.first / event.rows;
    this.filtro.qtdeItensPagina = event.rows;
    this.first = event.first;
    if (!!event.sortField) {
      this.filtro.nomeColuna = event.sortField;
      this.filtro.ordenacaoAscendente = event.sortOrder > 0 ? true : false;
      this.colunaSort = this.filtro.ordenacaoAscendente ? -1 : 1;
      this.cdr.detectChanges();
    }

    this.buscarLista(this.filtro);
  }

  editarUsuario(orcamentista: OrcamentistaIndicadorVendedorDto) {
    this.realizandoAcao = true;
    sessionStorage.setItem("urlAnterior", "/usuarios/usuario-edicao");

    if (!!orcamentista) {
      this.router.navigate(['/usuarios/usuario-edicao', orcamentista.id]);
    }
    else {
      this.router.navigate(['/usuarios/usuario-edicao', 'novo', { tipo: this.tipo }],);
    }
  }

  excluirClick(orcamentista: OrcamentistaIndicadorVendedorDto) {
    this.sweetAlertService.dialogo("", "Deseja excluir permanentemente este cadastro de usuário?").subscribe((r) => {
      if (!r) {
        return;
      }
      this.carregando = true;
      let request = new OrcamentistaIndicadorVendedorDeleteRequest();
      request.idIndicadorVendedor = orcamentista.id;
      this.orcamentistaIndicadorVendedorService.excluir(request).toPromise().then((r) => {
        if (!r.Sucesso) {
          this.carregando = false;
          this.sweetAlertService.aviso(r.Mensagem);
          return;
        }

        this.sweetAlertService.sucesso("Usuário exlcuído com sucesso!");
        this.carregando = false;

        if ((this.usuarioLista.length - 1 == 0)) {
          this.filtro.pagina--;
        }

        this.buscarLista(this.filtro);
      }).catch((e) => {
        this.carregando = false;
        this.alertaService.mostrarErroInternet(e);
      });
    });
  }

  ngOnDestroy() {
    if (!this.realizandoAcao) {
      sessionStorage.removeItem("filtro");
      sessionStorage.removeItem("urlAnterior");
    }
  }
}
