import { Component, OnInit } from '@angular/core';
import { PrePedidoDto } from 'src/app/dto/prepedido/DetalhesPrepedido/PrePedidoDto';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.component.html',
  styleUrls: ['./novo-pedido.component.scss']
})
export class NovoPedidoComponent implements OnInit {
  //#region Variaveis
  public step: number = 1
  cadastrarCliente: boolean = false
  itemPayment: any;
  public pedido: PrePedidoDto = new PrePedidoDto;
  //#endregion
  constructor() { }

  ngOnInit(): void {
    this.step = 1
  }

  //#region Step 1

  preencheDadosCliente(cliente) {
    if (cliente == "novocliente") {
        this.cadastrarCliente = true
        this.step = 2;
    } else {
      this.pedido.DadosCliente.Id = cliente.Id
      this.pedido.DadosCliente.Nome = cliente.Nome
      this.pedido.DadosCliente.Cnpj_Cpf = cliente.Cnpj_Cpf
      this.pedido.DadosCliente.Rg = cliente.Rg
      this.pedido.DadosCliente.Bairro = cliente.Bairro
      this.pedido.DadosCliente.Celular = cliente.Celular
      this.pedido.DadosCliente.Cep = cliente.Cep
      this.pedido.DadosCliente.Endereco = cliente.Endereco
      this.pedido.DadosCliente.Cidade = cliente.Cidade
      this.pedido.DadosCliente.Numero = cliente.Numero
      this.pedido.DadosCliente.Complemento = cliente.Complemento
      this.pedido.DadosCliente.Contato = cliente.Contato
      this.pedido.DadosCliente.DddCelular = cliente.DddCelular
      this.pedido.DadosCliente.DddComercial = cliente.DddComercial
      this.pedido.DadosCliente.DddComercial2 = cliente.DddComercial2
      this.pedido.DadosCliente.DddResidencial = cliente.DddResidencial
      this.pedido.DadosCliente.Email = cliente.Email
      this.pedido.DadosCliente.EmailXml = cliente.EmailXml
      this.pedido.DadosCliente.Observacao_Filiacao = cliente.Observacao_Filiacao
      this.pedido.DadosCliente.TelefoneResidencial = cliente.TelefoneResidencial
      this.pedido.DadosCliente.TelComercial = cliente.TelComercial
      this.pedido.DadosCliente.TelComercial2 = cliente.TelComercial2
      this.pedido.DadosCliente.Ramal = cliente.Ramal
      this.pedido.DadosCliente.Ramal2 = cliente.Ramal2
      this.pedido.DadosCliente.Nascimento = cliente.Nascimento
      this.pedido.DadosCliente.Sexo = cliente.Sexo
      this.pedido.DadosCliente.ProdutorRural = cliente.ProdutorRural
    }
  }
  //#endregion

  //#region Step2
  btnAvancarCriarCliente()
  {
    this.step = 3
  }
  //#endregion
}
