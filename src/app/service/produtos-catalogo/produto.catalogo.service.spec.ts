import { TestBed } from '@angular/core/testing';

import { ProdutoCatalogoService } from './produto.catalogo.service';

describe('ProdutoService', () => {
  let service: ProdutoCatalogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutoCatalogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
