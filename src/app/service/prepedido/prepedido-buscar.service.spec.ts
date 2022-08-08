/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrepedidoBuscarService } from './prepedido-buscar.service';

describe('Service: PrepedidoBuscar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrepedidoBuscarService]
    });
  });

  it('should ...', inject([PrepedidoBuscarService], (service: PrepedidoBuscarService) => {
    expect(service).toBeTruthy();
  }));
});
