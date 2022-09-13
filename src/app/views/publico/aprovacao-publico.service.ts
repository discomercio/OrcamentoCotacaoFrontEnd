import { Injectable } from '@angular/core';
import { OrcamentoCotacaoDto } from 'src/app/dto/orcamentos/OrcamentoCotacaoDto';

@Injectable({
  providedIn: 'root'
})
export class AprovacaoPublicoService {

  constructor() { }

  public orcamento: OrcamentoCotacaoDto;
  public paramGuid:any;
}
