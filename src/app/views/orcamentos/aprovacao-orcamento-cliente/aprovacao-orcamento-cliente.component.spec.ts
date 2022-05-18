import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovacaoOrcamentoClienteComponent } from './aprovacao-orcamento-cliente.component';

describe('AprovacaoOrcamentoClienteComponent', () => {
  let component: AprovacaoOrcamentoClienteComponent;
  let fixture: ComponentFixture<AprovacaoOrcamentoClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprovacaoOrcamentoClienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprovacaoOrcamentoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
