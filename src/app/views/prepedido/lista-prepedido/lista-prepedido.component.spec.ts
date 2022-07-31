import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPrepedidoComponent } from './lista-prepedido.component';

describe('ListaPrepedidoComponent', () => {
  let component: ListaPrepedidoComponent;
  let fixture: ComponentFixture<ListaPrepedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaPrepedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPrepedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
