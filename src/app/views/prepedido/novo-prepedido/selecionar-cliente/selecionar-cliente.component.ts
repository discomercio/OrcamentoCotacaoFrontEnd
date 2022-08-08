import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { BuscarClienteService } from 'src/app/service/prepedido/cliente/buscar-cliente.service';
import { ConfirmationDialogComponent } from 'src/app/utilities/confirmation-dialog/confirmation-dialog.component';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { TelaDesktopBaseComponent } from 'src/app/utilities/tela-desktop/tela-desktop-base.component';
import { TelaDesktopService } from 'src/app/utilities/tela-desktop/tela-desktop.service';
import { NovoPrepedidoDadosService } from '../novo-prepedido-dados.service';

@Component({
  selector: 'app-selecionar-cliente',
  templateUrl: './selecionar-cliente.component.html',
  styleUrls: ['./selecionar-cliente.component.scss']
})
export class SelecionarClienteComponent extends TelaDesktopBaseComponent implements OnInit {

  //se estamos buscando
  carregando = false;

  //o formulário, só 1 campo
  clienteBusca = "";

  constructor(telaDesktopService: TelaDesktopService,
    public readonly dialog: MatDialog,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    private readonly alertaService: AlertaService,
    private readonly buscarClienteService: BuscarClienteService, 
    private readonly novoPrepedidoDadosService: NovoPrepedidoDadosService) {
    super(telaDesktopService);
  }

  ngOnInit() {
    this.novoPrepedidoDadosService.prePedidoDto = null;
  }


  buscar() {
    
    //dá erro se não tiver nenhum dígito
    if (StringUtils.retorna_so_digitos(this.clienteBusca).trim() === "") {
      this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido ou vazio.`, '250px', null);
      return;
    }

    //valida
    if (!CpfCnpjUtils.cnpj_cpf_ok(this.clienteBusca)) {
      this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido.`, '250px', null);
      return;
    }

    //vamos fazer a busca
    this.carregando = true;
    this.buscarClienteService.buscar(this.clienteBusca).toPromise()
      .then((r) => {
        this.carregando = false;
        if (r === null) {
          this.mostrarNaoCadastrado();
          return;
        }
        //cliente já existe
        //verificar se daqui conseguimos zerar o 
        this.router.navigate(['confirmar-cliente', StringUtils.retorna_so_digitos(r.DadosCliente.Cnpj_Cpf)], { relativeTo: this.activatedRoute, state: r })
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
      });
  }

  //cliente ainda não está cadastrado
  mostrarNaoCadastrado() {
    this.carregando = false;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '380px',
      data: `Este CNPJ/CPF ainda não está cadastrado. Deseja cadastrá-lo agora?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        //vamos cadastrar um novo
        this.router.navigate(['cadastrar-cliente', this.clienteBusca], { relativeTo: this.activatedRoute })
      }
    });
  }

}
