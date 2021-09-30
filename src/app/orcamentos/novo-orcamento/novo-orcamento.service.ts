import { Injectable } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/orcamento-cotacao-dto';
import { ClienteOrcamentoCotacaoDto } from 'src/app/dto/clientes/cliente-orcamento-cotacao-dto';

@Injectable({
  providedIn: 'root'
})
export class NovoOrcamentoService {

  constructor() { }

  public orcamentoCotacaoDto: OrcamentoCotacaoDto;

criarNovo(){
  this.orcamentoCotacaoDto = new OrcamentoCotacaoDto();

}

  setarDados(clienteOrcamentoCotacaoDto:ClienteOrcamentoCotacaoDto){
    let orcamento = this.orcamentoCotacaoDto;
    orcamento.ClienteOrcamentoCotacaoDto = clienteOrcamentoCotacaoDto;
  }
}
