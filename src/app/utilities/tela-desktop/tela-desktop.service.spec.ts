import { TestBed } from '@angular/core/testing';

import { TelaDesktopService } from './tela-desktop.service';

describe('TelaDesktopService', () => {
  let service: TelaDesktopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelaDesktopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
