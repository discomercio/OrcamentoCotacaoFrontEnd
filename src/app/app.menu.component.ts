import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import { Usuario } from './dto/usuarios/usuario';
import { UsuarioTipo } from './dto/usuarios/UsuarioTipo';
import { AutenticacaoService } from './service/autenticacao/autenticacao.service';
import { MenuService } from './service/menu/menu.service';
import { AlertaService } from './utilities/alert-dialog/alerta.service';
import { Constantes } from './utilities/constantes';
import { eMenu } from './utilities/enums/eMenu';
import { ePermissao } from './utilities/enums/ePermissao';

@Component({
    selector: 'app-menu',
    template: `
    <ul class="layout-menu layout-main-menu clearfix">
        <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
    </ul>

    `
})
export class AppMenuComponent implements OnInit {
    constructor(private readonly menuService: MenuService,
        private readonly autenticacaoService: AutenticacaoService,
        private readonly alertaService: AlertaService) {
    }

    // public model: MenuItem[];
    public model: Array<MenuItem> = new Array();
    public constantes: Constantes = new Constantes();
    usuario = new Usuario();
    tipoUsuario: number;

    ngOnInit() {
        this.usuario = this.autenticacaoService.getUsuarioDadosToken();
        this.tipoUsuario = this.autenticacaoService.tipoUsuario;
        this.menuService.buscar().toPromise().then((r) => {
            if (r != null) {
                this.model = r;
                this.montarMenu();
            }
        }).catch(e => this.alertaService.mostrarMensagem("Ops! Tivemos problemas ao carregar o menu."));
    }

    montarMenu() {
        if (this.usuario.permissoes.length == 0) {
            this.alertaService.mostrarMensagem("Temos que logar novamente!");
            return;
        }
        this.model.forEach((x) => {
            for(let i = 0; i<x.items.length;i++){
                if(x.items[i].label== eMenu.Dashboards){
                    x.items.splice(i, 1);
                }
                if(!this.usuario.permissoes.includes(ePermissao.AdministradorDoModulo)){
                    if(x.items[i].label == eMenu.Catalogos){
                        for(let y = 0; y< x.items[i].items.length;y++){
                            if(x.items[i].items[y].label == eMenu.Propriedades){
                                x.items[i].items.splice(y, y);
                            }
                        }
                    }
                }
                if(this.tipoUsuario != this.constantes.PARCEIRO && x.items[i].label == eMenu.Usuarios){
                    x.items.splice(i, i);
                }
            }
        });

    }
}
