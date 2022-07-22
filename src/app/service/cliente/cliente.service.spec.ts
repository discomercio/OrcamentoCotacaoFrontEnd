/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClienteService } from './cliente.service';

describe('Service: BuscarCliente', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClienteService]
    });
  });

  it('should ...', inject([ClienteService], (service: ClienteService) => {
    expect(service).toBeTruthy();
  }));
});
