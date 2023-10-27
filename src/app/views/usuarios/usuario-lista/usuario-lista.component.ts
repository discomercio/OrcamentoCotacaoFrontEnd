import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { OrcamentistaIndicadorVendedorService } from '../../../service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { SelectItem } from 'primeng/api/selectitem';
import { Usuario } from 'src/app/dto/usuarios/usuario';
import { UsuarioTipo } from 'src/app/dto/usuarios/UsuarioTipo';
import { mergeMap } from 'rxjs/operators';
import { ePermissao } from 'src/app/utilities/enums/ePermissao';
import { ParcSemEntradaPrimPrestDto } from 'src/app/dto/forma-pagto/ParcSemEntradaPrimPrestDto';
import { Alert } from 'selenium-webdriver';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';
import { MatGridTileHeaderCssMatStyler } from '@angular/material';
import { OrcamentistaIndicadorVendedorDeleteRequest } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor-delete-request';

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
    private readonly sweetAlertService: SweetalertService) { }

  @ViewChild('dataTable') table: Table;
  usuarios: Array<OrcamentistaIndicadorVendedorDto> = new Array<OrcamentistaIndicadorVendedorDto>();
  usuariosApoio: Array<OrcamentistaIndicadorVendedorDto> = new Array<OrcamentistaIndicadorVendedorDto>();
  cols: any[];
  perfil: SelectItem;
  carregando: boolean;
  tipo: UsuarioTipo = 'todos';
  permite: boolean = false;
  pesquisa: string;
  first: number = 0;
  realizandoAcao: boolean = false;

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.UsuarioVendedorParceiro)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['dashboards']);
      return;
    }

    this.carregando = true;

    this.permite = this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar);
    this.criarColunas();
    let promise = [this.buscarUsuarios()];
    Promise.all(promise).then((r) => {
      this.setarUsuarios(r[0]);
    }).catch((e) => {
      this.carregando = false;
      this.alertaService.mostrarErroInternet(e);
    }).finally(() => {
      this.carregando = false;
      this.setarFiltro();
    });
  }

  buscarUsuarios(): Promise<OrcamentistaIndicadorVendedorDto[]> {
    if (this.autenticacaoService._tipoUsuario != 1) {
      return this.orcamentistaIndicadorVendedorService
        .buscarVendedoresParceirosPorParceiroELoja(this.autenticacaoService._parceiro, this.autenticacaoService._lojaLogado)
        .toPromise();
    }
    else {
      if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
        return this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorloja(this.autenticacaoService._lojaLogado)
          .toPromise();
      } else {
        return this.orcamentistaIndicadorVendedorService
          .buscarVendedoresParceirosPorVendedorELoja(this.autenticacaoService._usuarioLogado, this.autenticacaoService._lojaLogado)
          .toPromise();
      }
    }
  }

  setarUsuarios(r: OrcamentistaIndicadorVendedorDto[]) {
    if (r == null) {
      this.alertaService.mostrarMensagem("Nenhum usuário encontrado!");
      return;
    }
    this.usuarios = this.montarStringBusca(r);
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

  montarStringBusca(lista: Array<OrcamentistaIndicadorVendedorDto>): Array<OrcamentistaIndicadorVendedorDto> {
    lista.forEach(x => {
      x.stringBusca = `|${x.parceiro.toLocaleLowerCase()}|` +
        `${x.nome.toLocaleLowerCase()}|` +
        `${x.email.toLocaleLowerCase()}|` +
        `${x.vendedorResponsavel.toLocaleLowerCase()}|` +
        `${x.ativoLabel.toLocaleLowerCase()}|`;
    });

    this.usuariosApoio = lista;
    return lista;
  }

  setarFiltro(){
    let url = sessionStorage.getItem("urlAnterior");
    if (!!url && url.indexOf("/usuarios/usuario-edicao") > -1) {
      let json = sessionStorage.getItem("filtro");
      this.pesquisa = json;
      this.pesquisar();
    }
  }

  pesquisar() {
    if (this.pesquisa && this.pesquisa.length > 3) {
      this.usuarios = new Array<OrcamentistaIndicadorVendedorDto>();
      this.usuariosApoio.forEach(x => {
        if (x.stringBusca.indexOf(this.pesquisa) > -1) {
          this.usuarios.push(x);
        }
      });
      sessionStorage.setItem("filtro", this.pesquisa);

      this.first = 0;
      return;
    }

    this.usuarios = this.usuariosApoio;
    this.first = 0;
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
        this.first = 0;
        this.pesquisa = undefined;
        this.carregando = false;
        this.ngOnInit();
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
