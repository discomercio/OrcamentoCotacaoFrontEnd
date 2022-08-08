/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrepedidoListarService } from './prepedido-listar.service';

describe('Service: PrepedidoListar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrepedidoListarService]
    });
  });

  it('should ...', inject([PrepedidoListarService], (service: PrepedidoListarService) => {
    expect(service).toBeTruthy();
  }));
});
