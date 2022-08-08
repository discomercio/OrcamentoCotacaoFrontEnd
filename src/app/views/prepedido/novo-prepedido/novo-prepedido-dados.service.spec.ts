/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NovoPrepedidoDadosService } from './novo-prepedido-dados.service';

describe('Service: NovoPrepedidoDados', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NovoPrepedidoDadosService]
    });
  });

  it('should ...', inject([NovoPrepedidoDadosService], (service: NovoPrepedidoDadosService) => {
    expect(service).toBeTruthy();
  }));
});
