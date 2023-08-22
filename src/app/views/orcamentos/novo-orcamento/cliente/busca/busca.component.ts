import { Component, OnInit } from '@angular/core';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { NovoOrcamentoService } from '../../novo-orcamento.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Constantes } from 'src/app/utilities/constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { ClienteService } from 'src/app/service/cliente/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';

@Component({
  selector: 'app-busca',
  templateUrl: './busca.component.html',
  styleUrls: ['./busca.component.scss']
})
export class BuscaComponent implements OnInit {

  constructor(
    public readonly novoOrcamentoService: NovoOrcamentoService,
    private readonly clienteService: ClienteService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly alertaService: AlertaService
  ) { }

  mascaraCPFCNPJ: string;
  carregando: boolean;
  constantes = new Constantes();
  labelTipoCliente: string;
  idOrcamento: string;
  cpfCnpj: string;
  foco:boolean;
  ngOnInit(): void {
    this.carregando = true;

    //verificar se usuário pode aprovar
    this.idOrcamento = this.activatedRoute.snapshot.params.id;
    if (!this.novoOrcamentoService.orcamentoCotacaoDto.id && !!this.idOrcamento) {
      this.router.navigate(["orcamentos/aprovar-orcamento", this.idOrcamento]);
      return;
    }

    //verificar se o orçamento está preenchido
    //verificar se cliente do orçamento é pf ou pj
    if (this.novoOrcamentoService.orcamentoCotacaoDto.clienteOrcamentoCotacaoDto.tipo == this.constantes.ID_PF) {
      this.mascaraCPFCNPJ = StringUtils.inputMaskCPF();
      this.labelTipoCliente = "CPF";
    }
    else {
      this.mascaraCPFCNPJ = StringUtils.inputMaskCNPJ();
      this.labelTipoCliente = "CNPJ";
    }

    this.carregando = false;
    this.foco = true;
  }

  buscarCliente() {

    //dá erro se não tiver nenhum dígito
    if (StringUtils.retorna_so_digitos(this.cpfCnpj).trim() === "") {
      this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido ou vazio.`, '250px', null);
      return;
    }

    //valida
    if (!CpfCnpjUtils.cnpj_cpf_ok(this.cpfCnpj)) {
      this.alertaService.mostrarMensagemComLargura(`CNPJ/CPF inválido.`, '250px', null);
      return;
    }

    //vamos fazer a busca
    this.carregando = true;
    this.clienteService.buscar(this.cpfCnpj).toPromise()
      .then((r) => {
        this.carregando = false;

        this.novoOrcamentoService.orcamentoAprovacao.clienteCadastroDto = new ClienteCadastroDto();
        if (r !== null) {
          this.novoOrcamentoService.orcamentoAprovacao.clienteCadastroDto.DadosCliente = r.DadosCliente;
        }

        this.router.navigate(['orcamentos/cliente/aprovar-cliente-orcamento', this.idOrcamento]);
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
      });
  }
}
