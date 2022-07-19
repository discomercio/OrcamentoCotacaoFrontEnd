import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDetalhesComponent } from './pedido-detalhes.component';

describe('PedidoDetalhesComponent', () => {
  let component: PedidoDetalhesComponent;
  let fixture: ComponentFixture<PedidoDetalhesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoDetalhesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
