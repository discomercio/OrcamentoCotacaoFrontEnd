import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacaoService } from 'src/app/service/autenticacao/autenticacao.service';
import { Constantes } from 'src/app/utilities/constantes';
import { SweetalertService } from 'src/app/utilities/sweetalert/sweetalert.service';

@Component({
  selector: 'app-itens-orcamentos',
  templateUrl: './itens-orcamentos.component.html',
  styleUrls: ['./itens-orcamentos.component.scss']
})
export class ItensOrcamentosComponent implements OnInit {

  constructor(private readonly autenticacaoService: AutenticacaoService,
    private readonly sweetAlertService: SweetalertService) { }

  carregando: boolean;
  constantes: Constantes = new Constantes();
  ngOnInit(): void {
    this.carregando = true;

    if (this.autenticacaoService._tipoUsuario != this.constantes.VENDEDOR_UNIS) {
      this.carregando = false;
      this.sweetAlertService.aviso("Não encontramos a permissão necessária para acessar essa funcionalidade!");
      window.history.back();
      return;
    }

    //criar promises para buscar os combos
    this.carregando = false;

  }

}
