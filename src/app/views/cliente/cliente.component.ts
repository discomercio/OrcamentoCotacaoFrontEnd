import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AlertaService } from 'src/app/components/alert-dialog/alerta.service';
import { ClienteCadastroDto } from 'src/app/dto/clientes/ClienteCadastroDto';
import { CepsService } from 'src/app/service/ceps/ceps.service';
import { ClienteService } from 'src/app/service/cliente/cliente.service';
//import {InputTextareaModule} from 'primeng/inputtextarea';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  constructor(public _ceps: CepsService, public alertaService: AlertaService,
    public _ClienteService: ClienteService) { }

  public cliente = new ClienteCadastroDto()
  public estados: SelectItem[] = [];
  public produtorRural: SelectItem[] = [];
  public sexo: SelectItem[] = [];

  public residencial : any;
  public comercial : any;
  public comercial2 : any;
  public celular: any;

  ngOnInit(): void {

    this._ceps.buscarEstados().toPromise().then((r) => {
      if (r != null) {
        r.forEach(x => {
          let item: SelectItem = { label: x.uf, value: x.uf };
          this.estados.push(item);
        });
      }
    }).catch((r) => this.alertaService.mostrarErroInternet(r));

    this.produtorRural.push({ label: "NÃO", value: "1" });
    this.produtorRural.push({ label: "SIM", value: "2" });

    this.sexo.push({ label: "FEMININO", value: "F"})
    this.sexo.push({ label: "MASCULINO", value: "M"})

    /*       COD_ST_CLIENTE_PRODUTOR_RURAL_INICIAL = 0,
                COD_ST_CLIENTE_PRODUTOR_RURAL_NAO = 1,
                COD_ST_CLIENTE_PRODUTOR_RURAL_SIM = 2*/

    this.cliente.DadosCliente.Tipo = "PF"
  }

  exibirPF: boolean = true;

  cepSelecionado(selecionado) {
    this.preencheEndereco(selecionado)
  }

  preencheEndereco(endereco) {
    this.cliente.DadosCliente.Cep = endereco[0].Cep;
    this.cliente.DadosCliente.Endereco = endereco[0].Endereco;
    this.cliente.DadosCliente.Bairro = endereco[0].Bairro;
    this.cliente.DadosCliente.Cidade = endereco[0].Cidade;
    this.cliente.DadosCliente.Uf = endereco[0].Uf;
  }

  tipoPessoa_OnChange(tipo) {
    if (tipo == "PF") {
      this.exibirPF = true;
    } else {
      this.exibirPF = false;
    }
    this.cliente.DadosCliente.Tipo = tipo
  }

  // tipoPessoaSelPF() {
  //   this.exibirPF = true;
  // }

  // tipoPessoaSelPJ() {
  //   this.exibirPF = false;
  // }

  inserirCliente() {
    if (this.celular != undefined) {
      this.cliente.DadosCliente.DddCelular = this.celular.substring(0, 2);
      this.cliente.DadosCliente.Celular = this.celular.substring(2);
    }
    if (this.comercial != undefined) {
      this.cliente.DadosCliente.DddComercial = this.comercial.substring(0, 2);
      this.cliente.DadosCliente.TelComercial = this.comercial.substring(2);
    }
    if (this.comercial2 != undefined) {
      this.cliente.DadosCliente.DddComercial2 = this.comercial2.substring(0, 2);
      this.cliente.DadosCliente.TelComercial2 = this.comercial2.substring(2);
    }
    if (this.residencial != undefined) {
      this.cliente.DadosCliente.DddResidencial = this.residencial.substring(0, 2);
      this.cliente.DadosCliente.TelefoneResidencial = this.residencial.substring(2);
    }
    this._ClienteService.cadastrarCliente(this.cliente).toPromise().then(x => {
      if(x.length > 0){
        let erros = "";
        x.forEach(element => {
          erros += element + "\r\n";
        });

        this.alertaService.mostrarMensagem(erros)
      }
    });
  }
}
