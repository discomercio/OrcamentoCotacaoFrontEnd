import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesPrepedidoComponent } from './detalhes-prepedido.component';

describe('DetalhesPrepedidoComponent', () => {
  let component: DetalhesPrepedidoComponent;
  let fixture: ComponentFixture<DetalhesPrepedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalhesPrepedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhesPrepedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
