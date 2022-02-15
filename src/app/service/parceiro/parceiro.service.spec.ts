import { TestBed } from '@angular/core/testing';

import { ParceiroService } from './parceiro.service';

describe('ParceiroService', () => {
  let service: ParceiroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParceiroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
