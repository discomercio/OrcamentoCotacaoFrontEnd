/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PedidoComboNumeroService } from './pedido-combo-numero.service';

describe('Service: PedidoComboNumero', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoComboNumeroService]
    });
  });

  it('should ...', inject([PedidoComboNumeroService], (service: PedidoComboNumeroService) => {
    expect(service).toBeTruthy();
  }));
});
