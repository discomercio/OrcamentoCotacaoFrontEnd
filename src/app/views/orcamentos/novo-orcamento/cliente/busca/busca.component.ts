import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormataTelefone } from 'src/app/utilities/formatarString/formata-telefone';
import { StringUtils } from 'src/app/utilities/formatarString/string-utils';
import { NovoOrcamentoService } from '../../novo-orcamento.service';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { Constantes } from 'src/app/utilities/constantes';
import { CpfCnpjUtils } from 'src/app/utilities/cpfCnpjUtils';
import { ClienteService } from 'src/app/service/cliente/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DadosClienteCadastroDto } from 'src/app/dto/clientes/DadosClienteCadastroDto';

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

  @Output() inputValue = new EventEmitter();
  mascaraCPFCNPJ: string;
  carregando: boolean;
  constantes = new Constantes();
  cpfCnpj: string;
  labelTipoCliente: string;
  idOrcamento:string;

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
        if (r === null) {
          return;
        }

        this.novoOrcamentoService.dadosClienteCadastroDto = new DadosClienteCadastroDto();
        this.novoOrcamentoService.dadosClienteCadastroDto = r.DadosCliente;
        this.router.navigate(['orcamentos/cliente/aprovar-cliente-orcamento', this.idOrcamento]);
          
        //cliente já existe
        //verificar se daqui conseguimos zerar o 
        //this.router.navigate(['confirmar-cliente', StringUtils.retorna_so_digitos(r.DadosCliente.Cnpj_Cpf)], { relativeTo: this.activatedRoute, state: r })
      }).catch((r) => {
        //deu erro na busca
        //ou não achou nada...
        this.carregando = false;
        this.alertaService.mostrarErroInternet(r);
      });
  }
}
