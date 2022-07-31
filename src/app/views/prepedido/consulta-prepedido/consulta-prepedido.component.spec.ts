import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPrepedidoComponent } from './consulta-prepedido.component';

describe('ConsultaPrepedidoComponent', () => {
  let component: ConsultaPrepedidoComponent;
  let fixture: ComponentFixture<ConsultaPrepedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaPrepedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaPrepedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
