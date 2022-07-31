import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoCelularComponent } from './pedido-celular.component';

describe('PedidoCelularComponent', () => {
  let component: PedidoCelularComponent;
  let fixture: ComponentFixture<PedidoCelularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoCelularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoCelularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
