import { TestBed } from '@angular/core/testing';

import { ValidacaoCustomizadaService } from './validacao-customizada.service';

describe('ValidacaoCustomizadaService', () => {
  let service: ValidacaoCustomizadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidacaoCustomizadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
