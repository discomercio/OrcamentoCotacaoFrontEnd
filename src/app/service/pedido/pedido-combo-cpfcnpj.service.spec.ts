/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PedidoComboCpfcnpjService } from './pedido-combo-cpfcnpj.service';

describe('Service: PedidoComboCpfcnpj', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoComboCpfcnpjService]
    });
  });

  it('should ...', inject([PedidoComboCpfcnpjService], (service: PedidoComboCpfcnpjService) => {
    expect(service).toBeTruthy();
  }));
});
