import { AutenticacaoService } from './../../service/autenticacao/autenticacao.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-usuario-meusdados',
  templateUrl: './usuario-meusdados.component.html',
  styleUrls: ['./usuario-meusdados.component.scss']
})
export class UsuarioMeusdadosComponent implements OnInit {

  constructor(
    public readonly autenticacaoService: AutenticacaoService
  ) { }

  ngOnInit(): void {
  }

}
