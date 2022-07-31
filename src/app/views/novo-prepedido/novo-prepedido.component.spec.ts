import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoPrepedidoComponent } from './novo-prepedido.component';

describe('NovoPrepedidoComponent', () => {
  let component: NovoPrepedidoComponent;
  let fixture: ComponentFixture<NovoPrepedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovoPrepedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoPrepedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
