import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePedidoCadastrarClienteComponent } from './prepedidocadastrar-cliente.component';

describe('PrePedidoCadastrarClienteComponent', () => {
  let component: PrePedidoCadastrarClienteComponent;
  let fixture: ComponentFixture<PrePedidoCadastrarClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrePedidoCadastrarClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrePedidoCadastrarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
