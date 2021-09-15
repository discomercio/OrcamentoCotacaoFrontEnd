import { TestBed } from '@angular/core/testing';

import { LojasService } from './lojas.service';

describe('LojasService', () => {
  let service: LojasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LojasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
