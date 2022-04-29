import { TestBed } from '@angular/core/testing';

import { OrcamentosService } from './orcamentos.service';

describe('OrcamentosService', () => {
  let service: OrcamentosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrcamentosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
