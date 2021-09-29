import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarProdutoComponent } from './visualizar-produto.component';

describe('VisualizarProdutoComponent', () => {
  let component: VisualizarProdutoComponent;
  let fixture: ComponentFixture<VisualizarProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarProdutoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
