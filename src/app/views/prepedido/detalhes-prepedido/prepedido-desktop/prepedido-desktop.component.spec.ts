import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepedidoDesktopComponent } from './prepedido-desktop.component';

describe('PrepedidoDesktopComponent', () => {
  let component: PrepedidoDesktopComponent;
  let fixture: ComponentFixture<PrepedidoDesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepedidoDesktopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepedidoDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
