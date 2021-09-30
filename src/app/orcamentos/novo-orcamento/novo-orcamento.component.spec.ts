import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoOrcamentoComponent } from './novo-orcamento.component';

describe('NovoOrcamentoComponent', () => {
  let component: NovoOrcamentoComponent;
  let fixture: ComponentFixture<NovoOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NovoOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
