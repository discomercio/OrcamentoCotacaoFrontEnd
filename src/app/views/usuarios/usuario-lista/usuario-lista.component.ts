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
  carregando: boolean = false;
  tipo: UsuarioTipo = 'todos';
  permite: boolean = false;
  pesquisa: string;
  first: number = 0;

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.UsuarioVendedorParceiro)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['orcamentos/listar/orcamentos']);
      return;
    }

    this.permite = this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar);
    this.criarColunas();
    this.buscarUsuarios();
  }

  buscarUsuarios() {
    if (this.autenticacaoService._tipoUsuario != 1) {
      this.orcamentistaIndicadorVendedorService
        .buscarVendedoresParceirosPorParceiroELoja(this.autenticacaoService._parceiro, this.autenticacaoService._lojaLogado)
        .toPromise()
        .then((r) => {
          if (r == null) {
            this.alertaService.mostrarMensagem("Nenhum usuário encontrado!");
            return;
          }
          this.usuarios = this.montarStringBusca(r);
        }).catch((e) => {
          this.alertaService.mostrarErroInternet(e);
        });
    }
    else {
      if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)) {
        this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorloja(this.autenticacaoService._lojaLogado)
          .toPromise()
          .then((r) => {
            if (r == null) {
              this.alertaService.mostrarMensagem("Nenhum usuário encontrado!");
              return;
            }
            this.usuarios = this.montarStringBusca(r);
          }).catch((e) => {
            this.alertaService.mostrarErroInternet(e);
          });
      }
      else {
        this.orcamentistaIndicadorVendedorService
          .buscarVendedoresParceirosPorVendedorELoja(this.autenticacaoService._usuarioLogado, this.autenticacaoService._lojaLogado)
          .toPromise()
          .then((r) => {
            if (r == null) {
              this.alertaService.mostrarMensagem("Nenhum usuário encontrado!");
              return;
            }
            this.usuarios = this.montarStringBusca(r);
          }).catch((e) => {
            this.alertaService.mostrarErroInternet(e);
          });
      }
    }
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

  pesquisar() {

    if (this.pesquisa && this.pesquisa.length > 3) {
      this.usuarios = new Array<OrcamentistaIndicadorVendedorDto>();
      this.usuariosApoio.forEach(x => {
        if (x.stringBusca.indexOf(this.pesquisa) > -1) {
          this.usuarios.push(x);
        }
      });
      this.first = 0;
      return;
    }

    this.usuarios = this.usuariosApoio;
    this.first = 0;
  }

  editarUsuario(orcamentista: OrcamentistaIndicadorVendedorDto) {
    if (!!orcamentista) {
      this.router.navigate(['/usuarios/usuario-edicao', orcamentista.id]);
    }
    else {
      this.router.navigate(['/usuarios/usuario-edicao', 'novo', { tipo: this.tipo }],);
    }
  }

  excluirClick(orcamentista: OrcamentistaIndicadorVendedorDto) {
    this.sweetAlertService.dialogo("", "Deseja excluir permanentemente este cadastro de usuário?").subscribe((r)=>{
      if(!r){
        return;
      }

      //vamos chamar o endpoint aqui.
      this.orcamentistaIndicadorVendedorService.excluir(orcamentista.id).toPromise().then((r)=>{
        if(!r){
          this.sweetAlertService.aviso("Colocar mensagem de retorno aqui, pois não pode excluir");
          return;
        }

        this.sweetAlertService.sucesso("Usuário exlcuído com sucesso!");
        this.ngOnInit();
      }).catch((e)=>{
        this.alertaService.mostrarErroInternet(e);
      })
    })

      
  }
}
