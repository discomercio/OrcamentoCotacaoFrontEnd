import { TestBed } from '@angular/core/testing';

import { CepsService } from './ceps.service';

describe('CepsService', () => {
  let service: CepsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CepsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
