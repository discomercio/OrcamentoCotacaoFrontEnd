import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoPropriedadesEditarComponent } from './editar.component';

describe('ProdutosCatalogoEditarComponent', () => {
    let component: ProdutosCatalogoPropriedadesEditarComponent;
    let fixture: ComponentFixture<ProdutosCatalogoPropriedadesEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [ProdutosCatalogoPropriedadesEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(ProdutosCatalogoPropriedadesEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
