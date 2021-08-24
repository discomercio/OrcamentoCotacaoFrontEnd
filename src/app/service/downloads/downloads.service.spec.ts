import { TestBed } from '@angular/core/testing';

import { DownloadsService } from './downloads.service';

describe('DownloadsService', () => {
  let service: DownloadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
