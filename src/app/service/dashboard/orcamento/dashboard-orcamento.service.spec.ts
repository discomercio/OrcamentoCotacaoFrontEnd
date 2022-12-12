import { TestBed } from '@angular/core/testing';

import { DashboardOrcamentoService } from './dashboard-orcamento.service';

describe('DashboardOrcamentoService', () => {
  let service: DashboardOrcamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardOrcamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
