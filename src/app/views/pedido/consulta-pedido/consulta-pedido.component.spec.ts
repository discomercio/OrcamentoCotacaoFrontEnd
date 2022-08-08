import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPedidoComponent } from './consulta-pedido.component';

describe('ConsultaPedidoComponent', () => {
  let component: ConsultaPedidoComponent;
  let fixture: ComponentFixture<ConsultaPedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaPedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
