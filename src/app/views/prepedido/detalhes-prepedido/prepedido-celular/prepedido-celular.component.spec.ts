import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepedidoCelularComponent } from './prepedido-celular.component';

describe('PrepedidoCelularComponent', () => {
  let component: PrepedidoCelularComponent;
  let fixture: ComponentFixture<PrepedidoCelularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepedidoCelularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepedidoCelularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
