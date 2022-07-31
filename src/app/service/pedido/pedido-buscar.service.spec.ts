/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PedidoBuscarService } from './pedido-buscar.service';

describe('Service: PedidoBuscar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoBuscarService]
    });
  });

  it('should ...', inject([PedidoBuscarService], (service: PedidoBuscarService) => {
    expect(service).toBeTruthy();
  }));
});
