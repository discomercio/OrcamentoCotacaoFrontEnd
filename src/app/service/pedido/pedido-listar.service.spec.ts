/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PedidoListarService } from './pedido-listar.service';

describe('Service: PedidoListar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoListarService]
    });
  });

  it('should ...', inject([PedidoListarService], (service: PedidoListarService) => {
    expect(service).toBeTruthy();
  }));
});
