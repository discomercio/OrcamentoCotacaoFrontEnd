import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { DadosClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/DadosClienteCadastroDto';
import { ClienteCadastroDto } from 'src/app/dto/prepedido/ClienteCadastro/ClienteCadastroDto';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';


@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent extends TelaDesktopBaseComponent implements OnInit {

  constructor(private readonly router: Router,
    private readonly location: Location,
    telaDesktopService: TelaDesktopService,
    public readonly buscarClienteService: BuscarClienteService,
    public readonly alertaService: AlertaService,
    public readonly activatedRoute: ActivatedRoute) {
    super(telaDesktopService);
  }


  ngOnInit() {
    const cpfcnpj = StringUtils.retorna_so_digitos(this.activatedRoute.snapshot.params.cpfcnpj);
    this.buscarClienteService.buscar(cpfcnpj).toPromise()
      .then((r) => {
        if (r === null) {
          //erro...
          this.alertaService.mostrarErroInternet(r);
          return;
        }
        //cliente já existe
        this.dadosClienteCadastroDto = r.DadosCliente;
        this.clienteCadastroDto = r;
      }).catch((r) => {
        //erro...
        this.alertaService.mostrarErroInternet(r);
      });
  }

  voltar() {
    this.location.back();

  }

  dadosClienteCadastroDto = new DadosClienteCadastroDto();
  clienteCadastroDto = new ClienteCadastroDto();
}
