import { Injectable } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';
import { Constantes } from 'src/app/utilities/constantes';

@Injectable({
  providedIn: 'root'
})
export class AprovacaoPublicoService {

  constructor() { }

  public orcamento: OrcamentoCotacaoDto;
  public paramGuid:any;
  constantes: Constantes = new Constantes();

  BuscaDonoOrcamento(): string {
    if (this.orcamento?.vendedorParceiro != null) {
      return this.orcamento.vendedorParceiro;
    }
    if (this.orcamento?.parceiro != null && this.orcamento?.parceiro != this.constantes.SEM_INDICADOR) {
      //parceiro é o dono
      return this.orcamento.parceiro;
    }
    if (this.orcamento?.vendedor != null) {
      //vendedor é o dono
      return this.orcamento.vendedor;
    }

    return;
  }
}
