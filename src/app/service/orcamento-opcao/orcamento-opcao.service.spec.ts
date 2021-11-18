import { TestBed } from '@angular/core/testing';

import { OrcamentoOpcaoService } from './orcamento-opcao.service';

describe('OrcamentoOpcaoService', () => {
  let service: OrcamentoOpcaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrcamentoOpcaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
