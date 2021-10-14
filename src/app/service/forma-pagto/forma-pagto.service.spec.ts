import { TestBed } from '@angular/core/testing';

import { FormaPagtoService } from './forma-pagto.service';

describe('FormaPagtoService', () => {
  let service: FormaPagtoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormaPagtoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
