/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ImpressaoService } from './impressao.service';

describe('Service: Impressao', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImpressaoService]
    });
  });

  it('should ...', inject([ImpressaoService], (service: ImpressaoService) => {
    expect(service).toBeTruthy();
  }));
});
