import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutosCatalogoVisualizarComponent } from './visualizar.component';

describe('ProdutosCatalogoVisualizarComponent', () => {
  let component: ProdutosCatalogoVisualizarComponent;
  let fixture: ComponentFixture<ProdutosCatalogoVisualizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdutosCatalogoVisualizarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutosCatalogoVisualizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
