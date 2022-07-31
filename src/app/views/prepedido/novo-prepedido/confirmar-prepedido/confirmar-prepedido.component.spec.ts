import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarPrepedidoComponent } from './confirmar-prepedido.component';

describe('ConfirmarPrepedidoComponent', () => {
  let component: ConfirmarPrepedidoComponent;
  let fixture: ComponentFixture<ConfirmarPrepedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmarPrepedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarPrepedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
