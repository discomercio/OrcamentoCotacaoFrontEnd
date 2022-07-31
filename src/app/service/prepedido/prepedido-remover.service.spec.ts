/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrepedidoRemoverService } from './prepedido-remover.service';

describe('Service: PrepedidoRemover', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrepedidoRemoverService]
    });
  });

  it('should ...', inject([PrepedidoRemoverService], (service: PrepedidoRemoverService) => {
    expect(service).toBeTruthy();
  }));
});
