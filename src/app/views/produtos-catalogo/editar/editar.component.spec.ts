import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoEditarComponent } from './editar.component';

describe('ProdutosCatalogoEditarComponent', () => {
  let component: ProdutosCatalogoEditarComponent;
  let fixture: ComponentFixture<ProdutosCatalogoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdutosCatalogoEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutosCatalogoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
