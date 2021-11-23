import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesteOrcamentoComponent } from './teste-orcamento.component';

describe('TesteOrcamentoComponent', () => {
  let component: TesteOrcamentoComponent;
  let fixture: ComponentFixture<TesteOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TesteOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TesteOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
