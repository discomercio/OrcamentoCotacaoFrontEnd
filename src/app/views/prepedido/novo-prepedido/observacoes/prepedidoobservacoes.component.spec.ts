import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePedidoObservacoesComponent } from './prepedidoobservacoes.component';

describe('PrePedidoObservacoesComponent', () => {
  let component: PrePedidoObservacoesComponent;
  let fixture: ComponentFixture<PrePedidoObservacoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrePedidoObservacoesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrePedidoObservacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
