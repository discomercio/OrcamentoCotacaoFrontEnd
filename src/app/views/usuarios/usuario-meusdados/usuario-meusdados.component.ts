import { Usuario } from '../../../dto/usuarios/usuario';
import { AutenticacaoService } from '../../../service/autenticacao/autenticacao.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-usuario-meusdados',
  templateUrl: './usuario-meusdados.component.html',
  styleUrls: ['./usuario-meusdados.component.scss']
})
export class UsuarioMeusdadosComponent implements OnInit {

    public usuario: Usuario;
    public versaoApi: string;

  constructor(public readonly autenticacaoService: AutenticacaoService) { }

    ngOnInit(): void {
        this.usuario = new Usuario();
        this.versaoApi = localStorage.getItem('versaoApi');

        if(this.autenticacaoService._usuarioLogado) {
            this.usuario.nome = this.autenticacaoService._usuarioLogado;
            this.usuario.tipoUsuario = this.autenticacaoService._tipoUsuario;
            this.usuario.loja = this.autenticacaoService._lojaLogado;
            this.usuario.idVendedor = this.autenticacaoService._vendedor;
            this.usuario.idParceiro = this.autenticacaoService._parceiro;
            this.usuario.unidadeNegocio = this.autenticacaoService.unidade_negocio;
            this.usuario.permissoes = this.autenticacaoService._permissoes;
        }
    }
}
