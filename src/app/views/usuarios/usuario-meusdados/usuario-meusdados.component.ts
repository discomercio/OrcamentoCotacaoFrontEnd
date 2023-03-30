import { Usuario } from '../../../dto/usuarios/usuario';
import { Operacao } from '../../../dto/operacao/operacao';
import { AutenticacaoService } from '../../../service/autenticacao/autenticacao.service';
import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../service/usuarios/usuarios.service';
import { SistemaService } from '../../../service/Sistema/sistema.service';
import { SistemaResponse } from 'src/app/service/sistema/sistemaResponse';
import { AppSettingsService } from 'src/app/utilities/appsettings/appsettings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-usuario-meusdados',
  templateUrl: './usuario-meusdados.component.html',
  styleUrls: ['./usuario-meusdados.component.scss']
})
export class UsuarioMeusdadosComponent implements OnInit {

  //env: environment;

  public usuario: Usuario;
  public versaoFrontCache: string;
  public versaoFront: string;

  public versaoApi: string;
  public versaoApiCache: string;

  public operacao: Operacao[];

  confrontoVersao: boolean;

  constructor(public readonly autenticacaoService: AutenticacaoService,
    public readonly sistemaService: SistemaService,
    public readonly usuariosService: UsuariosService,
    private appSettingsService: AppSettingsService) {

  }

  ngOnInit(): void {
    this.usuario = new Usuario();
    this.versaoFront = environment.version;

    this.usuariosService.buscarOperacaoUsuarioPorModuloCotac().toPromise().then((r) => {
      if (r != null) {
        this.operacao = r;
      }
    })

    if (this.autenticacaoService._usuarioLogado) {
      this.usuario.nome = this.autenticacaoService._usuarioLogado;
      this.usuario.tipoUsuario = this.autenticacaoService._tipoUsuario;
      this.usuario.loja = this.autenticacaoService._lojaLogado;
      this.usuario.idVendedor = this.autenticacaoService._vendedor;
      this.usuario.idParceiro = this.autenticacaoService._parceiro;
      this.usuario.unidadeNegocio = this.autenticacaoService.unidade_negocio;
      this.usuario.permissoes = this.autenticacaoService._permissoes;

    }

    this.sistemaService.retornarVersao().toPromise().then((r) => {
      if (r != null) {
        this.versaoApi = r.versao;
      }
    });

    this.validarVersao();

  }

  validarVersao() {

    if (this.versaoFront == this.versaoApi) {
      this.confrontoVersao = false;
    } else {
      this.confrontoVersao = true;
    }
  }

}
