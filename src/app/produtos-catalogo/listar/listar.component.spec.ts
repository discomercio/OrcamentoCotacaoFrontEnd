import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoListarComponent } from './listar.component';

describe('ProdutosCatalogoListarComponent', () => {
  let component: ProdutosCatalogoListarComponent;
  let fixture: ComponentFixture<ProdutosCatalogoListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdutosCatalogoListarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutosCatalogoListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
