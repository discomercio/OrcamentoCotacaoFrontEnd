import { TestBed } from '@angular/core/testing';

import { PrepedidoService } from './prepedido.service';

describe('PrepedidoService', () => {
  let service: PrepedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrepedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
