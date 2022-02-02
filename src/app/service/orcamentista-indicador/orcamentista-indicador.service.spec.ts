import { OrcamentistaIndicadorDto } from './../../dto/orcamentista-indicador/orcamentista-indicador';
import { TestBed } from '@angular/core/testing';
import { OrcamentistaIndicadorService } from './orcamentista-indicador.service';

describe('OrcamentistaIndicadorService', () => {
  let service: OrcamentistaIndicadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrcamentistaIndicadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
