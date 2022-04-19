import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoPropriedadesListarComponent } from './listar.component';

describe('ProdutosCatalogoListarComponent', () => {
    let component: ProdutosCatalogoPropriedadesListarComponent;
    let fixture: ComponentFixture<ProdutosCatalogoPropriedadesListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [ProdutosCatalogoPropriedadesListarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(ProdutosCatalogoPropriedadesListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
