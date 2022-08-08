import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePedidoConfirmarClienteComponent } from './prepedidoconfirmar-cliente.component';

describe('PrePedidoConfirmarClienteComponent', () => {
  let component: PrePedidoConfirmarClienteComponent;
  let fixture: ComponentFixture<PrePedidoConfirmarClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrePedidoConfirmarClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrePedidoConfirmarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
