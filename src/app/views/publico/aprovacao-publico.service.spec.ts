import { TestBed } from '@angular/core/testing';

import { AprovacaoPublicoService } from './aprovacao-publico.service';

describe('AprovacaoPublicoService', () => {
  let service: AprovacaoPublicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AprovacaoPublicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
