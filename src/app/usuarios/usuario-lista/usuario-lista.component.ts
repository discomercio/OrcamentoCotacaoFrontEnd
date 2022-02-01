import { OrcamentistaIndicadorVendedorDto } from 'src/app/dto/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor';
import { OrcamentistaIndicadorVendedorService } from './../../service/orcamentista-indicador-vendedor/orcamentista-indicador-vendedor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios/usuarios.service';
import { AlertaService } from 'src/app/utilities/alert-dialog/alerta.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { SelectItem } from 'primeng/api/selectitem';
import { Usuario } from 'src/app/dto/usuarios/usuario';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styleUrls: ['./usuario-lista.component.scss']
})
export class UsuarioListaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private readonly orcamentistaIndicadorVendedorService: OrcamentistaIndicadorVendedorService,
    private readonly alertaService: AlertaService,
    private readonly router: Router) { }

  @ViewChild('dataTable') table: Table;
  usuarios: OrcamentistaIndicadorVendedorDto[] = new Array<OrcamentistaIndicadorVendedorDto>();
  usuarioSelecionado: OrcamentistaIndicadorVendedorDto;
  public form: FormGroup;
  cols: any[];
  perfil: SelectItem;
  carregando: boolean = false;

  ngOnInit(): void {
    this.orcamentistaIndicadorVendedorService.buscarVendedoresParceiros(null).toPromise().then((r) => {
      if (r == null) {
        ;
        this.alertaService.mostrarErroInternet(r);
        return;
      }
      this.usuarios = r;
    }).catch((r) => this.alertaService.mostrarErroInternet(r));

    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      apelido: ['', [Validators.required]],
      perfil: ['', [Validators.required]]
    });
    this.cols = [
        {field : 'Nome', header: 'Nome'},
        {field : 'Email', header: 'E-mail'},
        {field : 'Indicador', header: 'Responsável'},
        {field : 'Ativo', header: 'Ativo'},
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
    else{
      this.router.navigate(['/usuarios/usuario-edicao', 'novo']);
    }
  }
}
