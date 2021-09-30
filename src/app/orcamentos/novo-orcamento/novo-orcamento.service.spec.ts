import { TestBed } from '@angular/core/testing';

import { NovoOrcamentoService } from './novo-orcamento.service';

describe('NovoOrcamentoService', () => {
  let service: NovoOrcamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NovoOrcamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
