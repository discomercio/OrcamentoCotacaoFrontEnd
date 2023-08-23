import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarClienteOrcamentoComponent } from './aprovar-cliente-orcamento.component';

describe('AprovarClienteOrcamentoComponent', () => {
  let component: AprovarClienteOrcamentoComponent;
  let fixture: ComponentFixture<AprovarClienteOrcamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprovarClienteOrcamentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprovarClienteOrcamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
