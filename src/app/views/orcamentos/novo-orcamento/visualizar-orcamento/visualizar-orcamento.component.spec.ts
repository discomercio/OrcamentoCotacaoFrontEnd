import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarOrcamentoComponent } from './visualizar-orcamento.component';

describe('VisualizarOrcamentoComponent', () => {
  let component: VisualizarOrcamentoComponent;
  let fixture: ComponentFixture<VisualizarOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
