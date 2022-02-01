import { TestBed } from '@angular/core/testing';

import { OrcamentistaIndicadorVendedorService } from './orcamentista-indicador-vendedor.service';

describe('OrcamentistaIndicadorVendedorService', () => {
  let service: OrcamentistaIndicadorVendedorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrcamentistaIndicadorVendedorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
