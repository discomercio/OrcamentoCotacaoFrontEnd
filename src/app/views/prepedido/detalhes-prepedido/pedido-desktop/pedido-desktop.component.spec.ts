import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDesktopComponent } from './pedido-desktop.component';

describe('PedidoDesktopComponent', () => {
  let component: PedidoDesktopComponent;
  let fixture: ComponentFixture<PedidoDesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoDesktopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
