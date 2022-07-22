import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepedidoDetalhesComponent } from './detalhes-prepedido.component';

describe('PrepedidoDetalhesComponent', () => {
  let component: PrepedidoDetalhesComponent;
  let fixture: ComponentFixture<PrepedidoDetalhesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepedidoDetalhesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepedidoDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
