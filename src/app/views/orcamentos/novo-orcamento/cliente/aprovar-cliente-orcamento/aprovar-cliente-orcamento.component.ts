import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';
import { NovoOrcamentoService } from '../../novo-orcamento.service';
import { Constantes } from 'src/app/utilities/constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';

@Component({
  selector: 'app-aprovar-cliente-orcamento',
  templateUrl: './aprovar-cliente-orcamento.component.html',
  styleUrls: ['./aprovar-cliente-orcamento.component.scss']
})
export class AprovarClienteOrcamentoComponent implements OnInit {

  constructor(private novoOrcamentoService: NovoOrcamentoService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router) { }

  clienteCadastrado: boolean;
  carregando: boolean;
  dadosClienteCadastroDto: DadosClienteCadastroDto;
  clientePF: boolean;
  constantes = new Constantes();
  cpfCnpjUtils = new CpfCnpjUtils();

  ngOnInit(): void {
    debugger;
    let idOrcamento = this.activatedRoute.snapshot.params.id;
    if (!this.novoOrcamentoService.orcamentoCotacaoDto.id) {
      this.router.navigate(["orcamentos/aprovar-orcamento", idOrcamento]);
      return;
    }

    this.carregando = true;
    if (!this.novoOrcamentoService.dadosClienteCadastroDto.Cnpj_Cpf) {
      this.clienteCadastrado = false;
    }
    else {
      this.clienteCadastrado = true;
      this.dadosClienteCadastroDto = this.novoOrcamentoService.dadosClienteCadastroDto;
    }

    if (this.dadosClienteCadastroDto.Tipo == this.constantes.ID_PF) {
      this.clientePF = true;
    }
    else {
      this.clientePF = false;
    }

    this.carregando = false;

    this.dadosClienteCadastroDto.Cnpj_Cpf
  }

}
