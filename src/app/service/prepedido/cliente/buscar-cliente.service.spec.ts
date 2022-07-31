/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BuscarClienteService } from './buscar-cliente.service';

describe('Service: BuscarCliente', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuscarClienteService]
    });
  });

  it('should ...', inject([BuscarClienteService], (service: BuscarClienteService) => {
    expect(service).toBeTruthy();
  }));
});
