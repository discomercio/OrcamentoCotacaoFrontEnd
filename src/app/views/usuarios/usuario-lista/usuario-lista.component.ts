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
    private readonly route: ActivatedRoute,
    private readonly router: Router) { }

  @ViewChild('dataTable') table: Table;
  usuarios: OrcamentistaIndicadorVendedorDto[] = new Array<OrcamentistaIndicadorVendedorDto>();
  usuarioSelecionado: OrcamentistaIndicadorVendedorDto;
  public form: FormGroup;
  cols: any[];
  perfil: SelectItem;
  carregando: boolean = false;
  tipo: UsuarioTipo = 'todos';
  permite: boolean = false;

  ngOnInit(): void {
    if (!this.autenticacaoService.verificarPermissoes(ePermissao.UsuarioVendedorParceiro)) {
      this.alertaService.mostrarMensagem("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      this.router.navigate(['orcamentos/listar/orcamentos']);
      return;
    }

    this.permite = this.autenticacaoService.verificarPermissoes(ePermissao.CadastroVendedorParceiroIncluirEditar);

    this.route.queryParamMap.pipe(
      mergeMap((params) => {

        this.tipo = params.get('tipo') as UsuarioTipo || 'todos';

        if (this.autenticacaoService._tipoUsuario != 1) {
          return this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorParceiroELoja(this.autenticacaoService._parceiro, this.autenticacaoService._lojaLogado)
        } else {
          if (this.autenticacaoService.verificarPermissoes(ePermissao.SelecionarQualquerIndicadorDaLoja)){
            return this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorloja(this.autenticacaoService._lojaLogado)
          }else{
            
            return this.orcamentistaIndicadorVendedorService.buscarVendedoresParceirosPorVendedorELoja(this.autenticacaoService._usuarioLogado, this.autenticacaoService._lojaLogado)
          }
          
        }

      })
    ).subscribe(r => {
      if (r == null) {
        this.alertaService.mostrarErroInternet('Nenhum usuário encontrado');
        return;
      }
      this.usuarios = r;
    },
      (error) => {
        this.alertaService.mostrarErroInternet(error);
      });

    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      apelido: ['', [Validators.required]],
      perfil: ['', [Validators.required]]
    });
    this.cols = [
      { field: 'parceiro', header: 'Parceiro' },
      { field: 'nome', header: 'Nome' },
      { field: 'email', header: 'E-mail', width: '300px' },
      { field: 'vendedorResponsavel', header: 'Responsável' },
      { field: 'ativoLabel', header: 'Ativo', width: '60px' },
      //   { field: 'Responsavel', header: 'Responsável' },
      //   { field: 'Papel', header: 'Papel' },
      //   { field: 'Nome', header: 'Nome' },
      //   { field: 'Apelido', header: 'Apelido' },
      //   { field: 'Ativo', header: 'Ativo' }
    ];
  }

  editarUsuario() {
    if (!!this.usuarioSelecionado) {
      this.router.navigate(['/usuarios/usuario-edicao', this.usuarioSelecionado.id]);
    }
    else {
      this.router.navigate(['/usuarios/usuario-edicao', 'novo', { tipo: this.tipo }],);
    }
  }
}
