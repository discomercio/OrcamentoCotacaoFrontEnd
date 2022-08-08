import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePedidoItensComponent } from './prepedidoitens.component';

describe('ItensComponent', () => {
  let component: PrePedidoItensComponent;
  let fixture: ComponentFixture<PrePedidoItensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrePedidoItensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrePedidoItensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
